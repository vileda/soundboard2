import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {actions as soundfileActions} from '../../redux/modules/soundfiles';
import Theme from '../../styles/mui-theme';
import map from 'lodash/map';
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
  soundfiles: state.soundfiles
});
export class HomeView extends React.Component {
  static propTypes = {
    soundfiles: PropTypes.object.isRequired,
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
    return (e) => {
      this.props.play(url);
    };
  }

  doSearch = debounce(() => this.props.search(this.state.query), 300);

  handleOnChange = (e) => {
    this.setState({query: e.target.value});
    this.doSearch();
  };

  render () {
    return (
      <div className='container'>
        <TextField floatingLabelText={'search'} type={'text'} value={this.state.query} onChange={this.handleOnChange} />
        {this.props.soundfiles.search.length
          ? <div style={{position: 'absolute', zIndex: 5, backgroundColor: Theme.palette.canvasColor}}>
              {this.props.soundfiles.search.map((url) => {
                const name = url.split('/').reverse()[0];
                const dir = url.split('/').reverse()[1];
                return <RaisedButton secondary
                                     onClick={this.handleOnClick(url)}
                                     style={{margin: 5}}
                                     key={`search_${url}`}
                                     label={`${dir}/${name}`} />;
              })}
            </div>
          : null
        }
        <ul>
        {map(this.props.soundfiles.items, (value, key) => {
          return (
            <li key={key} style={{display: 'inline-block', padding: '10px'}}>
              <Card>
                <CardHeader
                  title={key}
                  titleColor={Theme.palette.textColor}
                  textStyle={{padding: '0 50px 0 0'}}
                  actAsExpander
                  showExpandableButton
                />
                <CardActions style={{position: 'absolute', zIndex: 5, backgroundColor: Theme.palette.canvasColor}} expandable>
                  {value.map((url) => {
                    const name = url.split('/').reverse()[0];
                    return <RaisedButton secondary onClick={this.handleOnClick(url)} style={{marginBottom: 5}} key={url} label={name}/>;
                  })}
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

export default connect(mapStateToProps, soundfileActions)(HomeView);
