export const FETCH_FAILED = 'common/FETCH_FAILED';
export const FETCHING = 'common/FETCHING';
export const FETCH_DONE = 'common/FETCH_DONE';
export const RESET = 'common/RESET';
export const START_UPLOAD = 'common/upload/START';
export const END_UPLOAD = 'common/upload/END';
export const fetchFailed = error => ({
  type: FETCH_FAILED,
  error,
});

export const fetching = (data = null) => ({
  type: FETCHING,
  data: data || '',
});

export const fetchDone = data => ({
  type: FETCH_DONE,
  data: data || '',
});

export const reset = () => ({
  type: RESET,
});
export const clean = () => ({
  type: RESET,
});

export const startUpload = (file = null) => ({
  type: START_UPLOAD,
  data: file,
});

export const endUpload = (data = null) => ({
  type: END_UPLOAD,
  data,
});
