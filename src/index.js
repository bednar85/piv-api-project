import './styles.css';

const initialState = {
  filters: {
    name: '',
    status: '',
    gender: ''
  },
  results: [],
  allResults: []
};

let state = { ...initialState };

// Update Various Sections of State
function setFilters(name, value) {
  state = {
    ...state,
    filters: {
      ...state.filters,
      [name]: value
    }
  };
}

function setResults(results) {
  state = {
    ...state,
    results
  }
}

// Load Data Method
function loadCharacterData() {
  Promise.all([
    fetch('https://rickandmortyapi.com/api/character/?page=1'),
    fetch('https://rickandmortyapi.com/api/character/?page=2'),
    fetch('https://rickandmortyapi.com/api/character/?page=3')
  ]).then(responses => Promise.all(responses.map(response => response.json()))
  ).then(data => {
    // combine all of the results into one array
    const combinedResults = data.flatMap(datum => datum.results);

    // set allResults in the initial state as a source of truth
    initialState.allResults = combinedResults;

    setResults(combinedResults);
    renderResults(combinedResults);
  });  
}

// Filter Logic
function getFilteredResults(filters, results) {
  console.log('');
  console.log('getFilteredResults');
  console.log('  filters:', filters);
  console.log('  results:', results);

  const noFiltersSet = Object.values(filters).every(currentValue => currentValue === '');
  
  console.log('  noFiltersSet:', noFiltersSet);

  if (noFiltersSet) {
    return initialState.allResults;
  }

  // convert filter object to an array of entries
  // exclude key value pairs in which the value is an empty string
  // map over the remaining key value pairs so it's an array of only the active keys
  const activeFilterKeys = Object.entries(filters)
    .filter(currentEntry => currentEntry[1] !== '')
    .map(currentEntry => currentEntry[0]);

  console.log('  activeFilterKeys:', activeFilterKeys);

  const filteredResults = results.filter(result => {
    const conditions = {};

    console.log('');
    console.log('  result.name:', result.name);
    
    // check each condition
    if (activeFilterKeys.includes('name')) {
      const parsedResultName = result.name.toLowerCase();
      const parsedFilterName = filters.name.toLowerCase();

      conditions.name = parsedResultName.includes(parsedFilterName);
    }

    if (activeFilterKeys.includes('status')) {
      console.log('  result.status:', result.status);

      conditions.status = result.status.toLowerCase() === filters.status.toLowerCase();
    }

    if (activeFilterKeys.includes('gender')) {
      console.log('  result.gender:', result.gender);

      conditions.gender = result.gender.toLowerCase() === filters.gender.toLowerCase();
    }

    console.log('  conditions:', conditions);

    return Object.values(conditions).every(currentValue => currentValue === true);    
  });

  return filteredResults;
}

// Generated Elements
function renderResults(results) {
  document.getElementById('results').innerHTML = results
    .map(
      datum => `
  <div>    
    <img src="${datum.image}" width="160" height="160" />
    <div>id: ${datum.id}</div>
    <div>name: ${datum.name}</div>
    <div>status: ${datum.status}</div>
    <div>species: ${datum.species}</div>
    <div>gender: ${datum.gender}</div>
    <div>origin: ${datum.origin.name}</div>
    <div>location: ${datum.location.name}</div>
  </div>
  `
    )
    .join('');
}

// const paginationControlsElement = document.querySelector('.pagination-controls');

// paginationControlsElement.addEventListener(
//   'click',
//   (event) => {
//     if (
//       event.target.matches('.pagination-controls-btn--prev') &&
//       state.info.prev
//     ) {
//       loadData(state.info.prev);
//     }

//     if (
//       event.target.matches('.pagination-controls-btn--next') &&
//       state.info.next
//     ) {
//       loadData(state.info.next);
//     }

//     console.log('state:', state);
//   },
//   false
// );

// Event Handlers
function handleFilterChange(event) {
  const { name, value } = event.target;

  setFilters(name, value);

  const { allResults } = initialState;
  const { filters, results } = state;
  
  const filteredResults = getFilteredResults(filters, allResults);

  // if filteredResults.length !== results
  // reset current page

  setResults(filteredResults);

  renderResults(filteredResults);
}

// Event Listeners
const filterControlsElement = document.querySelector('.filter-controls');

filterControlsElement.addEventListener(
  'change',
  event => {
    if (event.target.matches('.filter-controls-select-input')) {
      handleFilterChange(event);
    }
  },
  false
);

// prevent form submittal via the Enter key, it's clearing the text input
filterControlsElement.addEventListener(
  'keydown',
  event => {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  },
  false
);

filterControlsElement.addEventListener(
  'keyup',
  event => {
    if (event.target.matches('.filter-controls-text-input')) {
      handleFilterChange(event);
    }
  },
  false
);

// Initial Data Call
loadCharacterData();
