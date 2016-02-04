import { combineReducers } from 'redux';
import { routeReducer as router } from 'react-router-redux';
import soundfiles from './modules/soundfiles';

export default combineReducers({
  soundfiles,
  router
});
