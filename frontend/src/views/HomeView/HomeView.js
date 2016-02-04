import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { actions as soundfileActions } from '../../redux/modules/soundfiles';
import map from 'lodash/map';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import RaisedButton from 'material-ui/lib/raised-button';

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
    play: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.load();
  }

  handleOnClick (url) {
    return (e) => {
      this.props.play(url);
    };
  }

  render () {
    return (
      <div className='container'>
        <ul>
        {map(this.props.soundfiles.items, (value, key) => {
          return (
            <li key={key} style={{display: 'inline-block', minWidth: 150, maxWidth: 300}}>
              <Card>
                <CardHeader
                  title={key}
                  actAsExpander
                  showExpandableButton
                />
                <CardActions style={{position: 'fixed', zIndex: 5, backgroundColor: 'white'}} expandable>
                  {value.map((url) => {
                    const name = url.split('/').reverse()[0];
                    return <RaisedButton onClick={this.handleOnClick(url)} style={{marginBottom: 5}} key={url} label={name}/>;
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
