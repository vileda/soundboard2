package soundboard;

import io.vertx.core.Vertx;

public class SoundboardMain {
	public static void main(String[] args) {
		final Vertx vertx = Vertx.vertx();
		vertx.deployVerticle(new Player());
		vertx.deployVerticle(new SoundboardVerticle());
	}
}
