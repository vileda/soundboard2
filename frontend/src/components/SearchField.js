import React, {PropTypes} from 'react';
import Theme from '../styles/mui-theme';
import debounce from 'lodash/debounce';
import {connect} from 'react-redux';
import TextField from 'material-ui/lib/text-field';
import {actions as soundfileActions} from '../redux/modules/soundfiles';

export class SearchField extends React.Component {
  static propType = {
    soundfiles: PropTypes.object.isRequired,
    search: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
  };

  state = {
    query: ''
  };

  doSearch = debounce(() => this.props.search(this.state.query), 500);

  handleOnChange = (e) => {
    this.setState({query: e.target.value});
    this.doSearch();
  };

  render () {
    return (
      <div>
        <TextField floatingLabelText={'search'} type={'text'} value={this.state.query} onChange={this.handleOnChange} />
        {this.props.soundfiles.search.length
          ? <div style={{position: 'absolute', zIndex: 5, backgroundColor: Theme.palette.canvasColor}}>
            {this.props.soundfiles.search.map((url) => {
              const name = url.split('/').reverse()[0];
              const dir = url.split('/').reverse()[1];
              return <button
                onClick={this.onClick(url)}
                style={{margin: 5}}
                key={`search_${url}`}>
                {`${dir}/${name}`}
              </button>;
            })}
          </div>
          : null
        };
      </div>
    )
  }
}

export default connect({}, soundfileActions)(SearchField);
