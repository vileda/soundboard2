import { createAction, handleActions } from 'redux-actions';

// ------------------------------------
// Constants
// ------------------------------------
export const SEARCHED = 'SEARCHED';

// ------------------------------------
// Actions
// ------------------------------------
export const searched = createAction(SEARCHED, (res) => res);

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.

const apiBaseURL = 'http://localhost:8080';

export const search = (term) => {
  return (dispatch) => {
    fetch(apiBaseURL + '/api/search?term=' + term)
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
