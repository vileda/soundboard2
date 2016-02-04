package soundboard;

import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.handler.sockjs.SockJSSocket;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

@Log4j2
public class WebsocketHandler implements Handler<SockJSSocket> {
	private final EventBus eventBus;
	private final Map<String, MessageConsumer<String>> consumers;

	public WebsocketHandler(final EventBus eventBus, final Map<String, MessageConsumer<String>> websocketConsumers) {
		this.eventBus = eventBus;
		this.consumers = websocketConsumers;
	}

	@Override
	public void handle(final SockJSSocket sockJSSocket) {
		final String sessionId = sockJSSocket.webSession().id();
		final MessageConsumer<String> sessionConsumer = consumers.get(sessionId);

		if (sessionConsumer == null) {
			final MessageConsumer<String> consumer = eventBus.consumer("play", message -> {
				final String id = sockJSSocket.webSession().get("id").toString();
				final JsonObject dashboardJson = new JsonObject(message.body());
				if (dashboardJson.getString("id").equals(id)) {
					sockJSSocket.write(Buffer.buffer(message.body()));
				}
			});
			log.info("bound WS handler to sessionId {}", sessionId);
			consumers.put(sessionId, consumer);
			log.info("registered consumers {}", consumers.size());
		}

		sockJSSocket.endHandler(aVoid -> {
			final MessageConsumer<String> consumer = consumers.get(sessionId);
			consumer.unregister();
			consumers.remove(sessionId);
			log.info("unregistered consumer for sessionId {}", sessionId);
		});
	}
}