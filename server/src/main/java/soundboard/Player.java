package soundboard;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.impl.ConcurrentHashSet;

import java.io.IOException;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentLinkedDeque;

public class Player extends AbstractVerticle {
	private final Deque<String> deque = new ConcurrentLinkedDeque<>();
	private final Set<Process> processes = new ConcurrentHashSet<>();
	private boolean isPlaying = false;

	@Override
	public void start() throws Exception {
		final EventBus eventBus = vertx.eventBus();

		eventBus.consumer("kill", message -> {
			System.out.println("killing");
			isPlaying = false;
			processes.forEach(Process::destroyForcibly);
			processes.clear();
		});

		Runtime r = Runtime.getRuntime();

		eventBus.<String>consumer("play", message -> {
			System.out.println("add play");
			deque.add(message.body());
			if(!isPlaying) {
				System.out.println("play queue");
				isPlaying = true;
				vertx.executeBlocking(future -> {
					String url;
					//noinspection InfiniteLoopStatement
					while (isPlaying) {
						if((url = deque.poll()) != null) {
							try {
								final String command = String.format(Config.get("play.command") + " %s", "\"" + url + "\"");
								System.out.println(command);
								ProcessBuilder mpv = new ProcessBuilder("/usr/bin/env", Config.get("play.command"), url);
								final Process process = mpv.start();
								processes.add(process);
								process.waitFor();
							} catch (IOException | InterruptedException e) {
								e.printStackTrace();
							}
						}
						else {
							isPlaying = false;
						}
					}
					future.complete();
				}, res -> System.out.println("ended queue"));
			}
		});
	}
}
