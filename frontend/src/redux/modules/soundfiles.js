import { createAction, handleActions } from 'redux-actions';

// ------------------------------------
// Constants
// ------------------------------------
export const SOUNDFILES_FETCHED = 'SOUNDFILES_FETCHED';

// ------------------------------------
// Actions
// ------------------------------------
export const fetched = createAction(SOUNDFILES_FETCHED, (res) => res);

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const load = () => {
  return (dispatch) => {
    fetch('http://localhost:8080/api/sounds')
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      dispatch(fetched(res));
    });
  };
};

export const play = (url) => {
  return () => {
    fetch('http://localhost:8080/api/play?url=' + url);
  };
};

export const actions = {
  load,
  fetched,
  play
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [SOUNDFILES_FETCHED]: (state, { payload }) => Object.assign({}, state, {items: payload})
}, {items: {}});
