import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {actions as soundfileActions} from '../../redux/modules/soundfiles';
import {actions as soundsearchActions} from '../../redux/modules/soundsearch';
import Theme from '../../styles/mui-theme';
import debounce from 'lodash/debounce';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';

// We define mapStateToProps where we'd normally use
// the @connect decorator so the data requirements are clear upfront, but then
// export the decorated component after the main class definition so
// the component can be tested w/ and w/o being connected.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
const mapStateToProps = (state) => ({
  soundfiles: state.soundfiles.items,
  searchResults: state.soundsearch
});
export class HomeView extends React.Component {
  static propTypes = {
    soundfiles: PropTypes.array.isRequired,
    searchResults: PropTypes.array.isRequired,
    load: PropTypes.func.isRequired,
    play: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired
  };

  state = {
    query: ''
  };

  componentWillMount () {
    this.props.load();
  }

  handleOnClick (url) {
    return () => {
      this.props.play(url);
    };
  }

  doSearch = debounce((query) => this.props.search(query), 200);

  handleOnChange = (e) => {
    this.doSearch(e.target.value);
  };

  handleOnExpandChange = (key) => {
    return (expanded) => {
      this.setState({[key + '_expanded']: expanded});
      console.debug(expanded);
    };
  };

  first (obj) {
    for (var a in obj) return a;
  }

  render () {
    return (
      <div className='container'>
        <TextField
          floatingLabelText={'search'}
          type={'text'}
          onChange={this.handleOnChange}
          style={{margin: '0 auto', display: 'block'}}
        />
        {this.props.searchResults.length
          ? <div style={{position: 'absolute', zIndex: 99999, backgroundColor: Theme.palette.canvasColor}}>
              {this.props.searchResults.map((url) => {
                const name = url.split('/').reverse()[0];
                const dir = url.split('/').reverse()[1];
                return (<RaisedButton
                  onClick={this.handleOnClick(url)}
                  style={{margin: 5}}
                  key={`search_${url}`}
                  label={`${dir}/${name}`}
                  secondary />);
              })}
            </div>
          : null
        }
        <ul>
        {this.props.soundfiles.map((entry) => {
          const key = this.first(entry);
          const value = entry[key];
          return (
            <li key={key} style={{display: 'inline-block', padding: '10px'}}>
              <Card
                onExpandChange={this.handleOnExpandChange(key)}
              >
                <CardHeader
                  title={key}
                  titleColor={Theme.palette.textColor}
                  textStyle={{padding: '0 50px 0 0'}}
                  actAsExpander
                  showExpandableButton
                />
                <CardActions style={{position: 'absolute', zIndex: 5, backgroundColor: Theme.palette.canvasColor}} expandable>
                  {this.state[key + '_expanded']
                    ? value.map((url) => {
                      const name = url.split('/').reverse()[0];
                      return <RaisedButton secondary onClick={this.handleOnClick(url)} style={{marginBottom: 5}} key={url} label={name}/>;
                    })
                    : null}
                </CardActions>
              </Card>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  ...soundfileActions,
  ...soundsearchActions
})(HomeView);
