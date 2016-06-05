package soundboard;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.file.FileProps;
import io.vertx.core.file.FileSystem;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import org.apache.commons.lang3.StringUtils;

import java.util.*;
import java.util.stream.Collectors;


public class SoundboardVerticle extends AbstractVerticle {

  public static final String UNCATEGORIZED = "uncategorized";

  @Override
  public void start() throws Exception {
    final HttpServer httpServer = vertx.createHttpServer();
    final EventBus eventBus = vertx.eventBus();
    final FileSystem fileSystem = vertx.fileSystem();
    final Map<String, List<String>> soundfiles = new TreeMap<>();

    Router router = Router.router(vertx);
    Router apiRouter = Router.router(vertx);

    CorsHandler corsHandler = CorsHandler.create("^.*$");
    router.route().handler(corsHandler);

    final String soundfilesPath = Config.get("soundfilesPath");

    apiRouter.get("/sounds").handler(routingContext -> {
      if (!soundfiles.isEmpty()) {
        routingContext.response().end(Json.encode(new SoundfileResponse(soundfiles)));
        soundfiles.clear();
      }

      soundfiles.put(UNCATEGORIZED, new ArrayList<>());
      fileSystem.readDirBlocking(soundfilesPath).forEach(name -> {
        final FileProps fileProps = fileSystem.propsBlocking(name);
        if (!fileProps.isDirectory()) {
          soundfiles.get(UNCATEGORIZED).add(name);
        }
        else {
          final String[] dirs = name.split("/");
          soundfiles.put(dirs[dirs.length - 1].toLowerCase(), fileSystem.readDirBlocking(name));
        }
      });

      if (!routingContext.response().ended()) {
        routingContext.response().end(Json.encode(new SoundfileResponse(soundfiles)));
      }
    });

    apiRouter.get("/search").handler(routingContext -> {
      final String term = routingContext.request().getParam("term");

      if(StringUtils.isBlank(term)) {
        routingContext.response().end(new JsonArray().encode());
        return;
      }

      List<String> paths = soundfiles
          .values().stream()
          .flatMap(Collection::stream)
          .sorted((o1, o2) -> {
            final int fuzzyDistance1 = StringUtils.getFuzzyDistance(o1, term, Locale.getDefault());
            final int fuzzyDistance2 = StringUtils.getFuzzyDistance(o2, term, Locale.getDefault());
            if (fuzzyDistance1 > fuzzyDistance2) return -1;
            if (fuzzyDistance1 == fuzzyDistance2) return 0;
            else return 1;
          })
          .collect(Collectors.toList());
      routingContext
          .response().end(Json.encode(paths.size() > 10 ? paths.subList(0, 10) : paths));
    });

    apiRouter.get("/play").handler(routingContext -> {
      final String url = routingContext.request().getParam("url");
      System.out.println(url);
      eventBus.publish("play", url);
      routingContext.response().end();
    });

    apiRouter.get("/kill").handler(routingContext -> {
      eventBus.publish("kill", "all");
      routingContext.response().end();
    });

    apiRouter.route().handler(routingContext -> {
      routingContext.response().headers().add("content-type", "application/json");
      routingContext.next();
    });

    router.mountSubRouter("/api", apiRouter);

    final SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);

    final SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);

    final Map<String, MessageConsumer<String>> consumers = new HashMap<>();
    final WebsocketHandler websocketHandler = new WebsocketHandler(eventBus, consumers);
    sockJSHandler.socketHandler(websocketHandler);

    router.route("/socket*").handler(sockJSHandler);

    final StaticHandler staticHandler = StaticHandler.create();
    staticHandler
        .setWebRoot("webroot")
        .setIndexPage("index.html");
    router.get()
          .pathRegex("^(/.+\\.(js|css|ttf|svg|gif|png|jpg|woff|ico))$")
          .handler(staticHandler);

    router.get("/*").handler(routingContext -> routingContext
        .response()
        .sendFile("webroot/index.html"));

    httpServer.requestHandler(router::accept).listen(3005);
  }
}
