package soundboard;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

public class Config {
	private static Config ourInstance = new Config();
	private Configuration configuration;

	public static Config getInstance() {
		return ourInstance;
	}

	private Config() {
		try {
			configuration = new PropertiesConfiguration("soundboard.properties");
		} catch (ConfigurationException e) {
			e.printStackTrace();
			System.exit(-1);
		}
	}

	public static String get(String key) {
		return getInstance().configuration.getString(key);
	}
}
