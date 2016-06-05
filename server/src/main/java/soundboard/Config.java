package soundboard;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.EnvironmentConfiguration;
import org.apache.commons.configuration.PropertiesConfiguration;

public class Config {
	private static Config ourInstance = new Config();
	private Configuration propertyConf;
	private EnvironmentConfiguration environmentConf;

	public static Config getInstance() {
		return ourInstance;
	}

	private Config() {
		try {
			propertyConf = new PropertiesConfiguration("soundboard.properties");
			environmentConf = new EnvironmentConfiguration();
		} catch (ConfigurationException e) {
			e.printStackTrace();
			System.exit(-1);
		}
	}

	public static String get(String key) {
		String value = getInstance().environmentConf.getString(key.toUpperCase().replace('.', '_'));
		if(value == null) {
			value = getInstance().propertyConf.getString(key);
		}

		return value;
	}
}
