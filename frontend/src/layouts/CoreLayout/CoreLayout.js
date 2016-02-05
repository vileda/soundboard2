import React, { PropTypes } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/lib/menus/menu-item';
import '../../styles/core.scss';

function CoreLayout ({ children }) {
  const handleOnLeftIconClick = () => {
    fetch('http://localhost:8080/api/kill');
  };

  return (
    <div className='page-container'>
      <AppBar
        title='soundboard'
        iconElementLeft={<IconButton onTouchTap={handleOnLeftIconClick}><NavigationClose /></IconButton>}
        iconElementRight={
      <IconMenu
        iconButtonElement={
          <IconButton><MoreVertIcon /></IconButton>
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText='Refresh' />
        <MenuItem primaryText='Help' />
        <MenuItem primaryText='Sign out' />
      </IconMenu>
    }
      />
      <div className='view-container'>
        {children}
      </div>
    </div>
  );
}

CoreLayout.propTypes = {
  children: PropTypes.element
};

export default CoreLayout;
