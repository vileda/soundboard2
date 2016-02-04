package soundboard;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.file.FileProps;
import io.vertx.core.file.FileSystem;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SoundboardVerticle extends AbstractVerticle {
	@Override
	public void start() throws Exception {
		final HttpServer httpServer = vertx.createHttpServer();
		final EventBus eventBus = vertx.eventBus();
		final FileSystem fileSystem = vertx.fileSystem();
		final Map<String, List<String>> soundfiles = new HashMap<>();

		Router router = Router.router(vertx);
		Router apiRouter = Router.router(vertx);

		final String soundfilesPath = Config.get("soundfilesPath");

		apiRouter.get("/sounds").handler(routingContext -> {
			if(!soundfiles.isEmpty()) {
				routingContext.response().end(Json.encode(soundfiles));
				soundfiles.clear();
			}

			soundfiles.put("Uncategorized", new ArrayList<>());
			fileSystem.readDirBlocking(soundfilesPath).forEach(name -> {
				final FileProps fileProps = fileSystem.propsBlocking(name);
				if(!fileProps.isDirectory()) {
					soundfiles.get("Uncategorized").add(name);
				}
				else {
					final String[] dirs = name.split("/");
					soundfiles.put(dirs[dirs.length-1], fileSystem.readDirBlocking(name));
				}
			});

			if(!routingContext.response().ended()) {
				routingContext.response().end(Json.encode(soundfiles));
			}
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

		router.mountSubRouter("/api", apiRouter);

		final SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);

		final SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);

		final Map<String, MessageConsumer<String>> consumers = new HashMap<>();
		final WebsocketHandler websocketHandler = new WebsocketHandler(eventBus, consumers);
		sockJSHandler.socketHandler(websocketHandler);

		router.route("/socket*").handler(sockJSHandler);

		final StaticHandler staticHandler = StaticHandler.create();
		router.get()
				.pathRegex("^(/.+\\.(js|css|ttf|svg|gif|png|jpg|woff|ico))$")
				.handler(staticHandler::handle);

		router.get("/*").handler(routingContext -> routingContext
				.response()
				.sendFile("../frontend/dist/webroot/index.html"));

		httpServer.requestHandler(router::accept).listen(8080);
	}
}
