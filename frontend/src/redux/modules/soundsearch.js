import { createAction, handleActions } from 'redux-actions';
import apiBaseURL from '../../api/index';

// ------------------------------------
// Constants
// ------------------------------------
export const SEARCHED = 'SEARCHED';

// ------------------------------------
// Actions
// ------------------------------------
export const searched = createAction(SEARCHED, (res) => res);

export const search = (term) => {
  return (dispatch) => {
    fetch(apiBaseURL + '/search?term=' + term)
      .then((res) => res.json())
      .then((res) => {
        dispatch(searched(res));
      });
  };
};

export const actions = {
  search,
  searched
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [SEARCHED]: (state, { payload }) => payload
}, []);
