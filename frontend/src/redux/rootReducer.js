import { combineReducers } from 'redux';
import { routeReducer as router } from 'react-router-redux';
import soundfiles from './modules/soundfiles';
import soundsearch from './modules/soundsearch';

export default combineReducers({
  soundfiles,
  soundsearch,
  router
});
