let apiBaseURL = '/api';

if (__DEV__) {
  apiBaseURL = 'http://localhost:8080/api';
}

export default apiBaseURL;
