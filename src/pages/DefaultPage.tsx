import React from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import SearchIcon from '@material-ui/icons/Search';
import CharacterResult, { SearchResult } from '../components/CharacterResult';
import { SwapiAPIResponse } from '../interfaces/swapi';

import './DefaultPage.stylus';

interface DefaultPageState {
  searchInput: string;
  loading: boolean;
  searchResult: SearchResult;
  searchNoResult: boolean;
}

// Note: You may get warning in console: https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
// Seems like Material UI team hasnt updated this component but it is StrictMode warning.
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class DefaultPage extends React.Component<{}, DefaultPageState> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: '',
      loading: false,
      searchResult: {
        name: '',
        gender: '',
        birth_year: '',
        height: '',
        hair_color: '',
        mass: '',
      },
      searchNoResult: false,
    };
    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.search = this.search.bind(this);
  }

  handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ searchInput: e.target.value, searchNoResult: false });
  }
  // Note: Switched to arrow function because "this" bindings did not allow access to "search"
  handleSearchInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.search();
    }
  };

  handleSnackbarClose = (e: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      console.log('click away');
      return;
    }
    this.setState({ searchNoResult: false });
  };

  search() {
    // Set loading
    this.setState({ loading: true, searchNoResult: false });
    // Perform query
    fetch('http://swapi.dev/api/people/?search=' + this.state.searchInput)
      .then(async (response) => {
        if (response.status === 200) {
          let body: SwapiAPIResponse = await response.json();
          if (body.count > 0) {
            this.setState({ searchResult: body.results[0] });
          } else {
            this.setState({ searchNoResult: true });
          }
          console.log('Wooo', body);
        } else {
          console.error('Nooo');
        }
      })
      .catch((err) => {
        console.error('Fetch Error - ' + err);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div className="page center vh">
        {/* Future-TODO: Figure out Vue:Slots equvilent so card can be reused...*/}
        <div className="card character-search-card">
          {/* Card Loading */}
          {this.state.loading ? (
            <div className="card-loading">
              <CircularProgress></CircularProgress>
            </div>
          ) : null}
          {/* Card Header */}
          <h5 className="card-header">STAR WARS HEROES</h5>
          {/* Card Body */}
          <div className="card-body">
            {/* Future-TODO: Refactor into own component */}
            {/* Search */}
            <div className="card-content hightlight-content padded">
              <div className="input-container">
                <label>Character Name</label>
                {/* Input */}
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  helperText="E.g. Luke Skywalker"
                  fullWidth
                  onChange={this.handleSearchInputChange}
                  onKeyDown={this.handleSearchInputKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Search"
                          onClick={() => {
                            this.search();
                          }}
                          edge="end"
                        >
                          <SearchIcon></SearchIcon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                ></TextField>
              </div>
            </div>
            {/* Search Body */}
            <CharacterResult result={this.state.searchResult}></CharacterResult>
            {/* Snackbar */}
            <Snackbar
              open={this.state.searchNoResult}
              autoHideDuration={5000}
              onClose={this.handleSnackbarClose}
            >
              <Alert onClose={this.handleSnackbarClose} severity="warning">
                No results found for {this.state.searchInput}
              </Alert>
            </Snackbar>
          </div>
        </div>
      </div>
    );
  }
}

export default DefaultPage;
