import React from 'react/addons';
import Reflux from 'reflux';
import _ from 'underscore';
import {dataInterface} from '../dataInterface';
import {
  Navigation,
} from 'react-router';
import actions from '../actions';
import bem from '../bem';
import stores from '../stores';
import Select from 'react-select';
import ui from '../ui';
import mixins from '../mixins';
import mdl from '../libs/rest_framework/material';
import DocumentTitle from 'react-document-title';

import {
  assign,
  t,
  log,
  formatTime,
} from '../utils';

var TeamMember = React.createClass({
  mixins: [
    mixins.permissions,
  ],
  render () {
    // TODO: get user's avatar, email from API
    var defaultGravatarImage = `${window.location.protocol}//www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?s=40`;

    var currentPerm = '';
    var cans = this.props.can;

    if (cans.change) {
      var currentPerm = 'change';
    } else if (cans.view) {
      var currentPerm = 'view';
    }

    var availablePermissions = [
      {value: 'view', label: t('Can View')},
      {value: 'change', label: t('Can Edit')}
    ];

    return (
      <bem.UserRow>
        <bem.UserRow__avatar>
          <img src={defaultGravatarImage} />
        </bem.UserRow__avatar>
        {this.props.username}
        <bem.UserRow__role>
        	{currentPerm}
        </bem.UserRow__role>
      </bem.UserRow>      
      );
  }
});

var FormSummary = React.createClass({
  mixins: [
    Navigation,
    Reflux.ListenerMixin,
    mixins.dmix
  ],
  updateRouteState () {
    var currentRoutes = this.context.router.getCurrentRoutes();
    var activeRoute = currentRoutes[currentRoutes.length - 1];
    this.setState(assign({
        currentRoute: activeRoute
      }
    ));
  },
  componentDidMount () {
    this.listenTo(stores.session, this.dmixSessionStoreChange);
    this.listenTo(stores.asset, this.dmixAssetStoreChange);
    this.listenTo(stores.asset, this.updateTeam);
    var uid = this.props.params.assetid || this.props.uid || this.props.params.uid;
    if (this.props.randdelay && uid) {
      window.setTimeout(()=>{
        actions.resources.loadAsset({id: uid});
      }, Math.random() * 3000);
    } else if (uid) {
      actions.resources.loadAsset({id: uid});
    }
    this.updateRouteState();
  },
  componentWillReceiveProps () {
    this.updateRouteState();
  },
  updateTeam () {
    var team = {};
		var defaultGravatarImage = `${window.location.protocol}//www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?s=40`;

    var team = {};
    if (this.state.access && this.state.access.change) {
    	Object.keys(this.state.access.change).map(function (key) {
    		team[key] = {
    			'username': key, 
    			'can': t('Can Edit'),
    			'avatar': defaultGravatarImage
    		};
			});

    	Object.keys(this.state.access.view).map(function (key) {
    		if (!team[key]) {
	    		team[key] = {
	    			'username': key, 
	    			'can': t('Can View'),
	    			'avatar': defaultGravatarImage
	    		};
    		}
			});
    }

    this.setState({
      team: team, 
    });    


  },
  render () {
    var docTitle = this.state.name || t('Untitled');
		var defaultGravatarImage = `${window.location.protocol}//www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?s=40`;
		var team = this.state.team;

    if (this.state.deployment__identifier != undefined && this.state.has_deployment) {
	    return (
	      <DocumentTitle title={`${docTitle} | KoboToolbox`}>
	        <bem.FormView m='scrollable'>
	          <bem.FormView__wrapper m='summary'>
	            <bem.FormView__row m='first-row'>
	              <bem.FormView__cell m='submissions'>
	                <bem.FormView__label m='title'>
	                  {t('Submissions')}
	                </bem.FormView__label>
	                Submissions Graph
	              </bem.FormView__cell>
	              <bem.FormView__cell m='stats'>
	              	<bem.FormView__group>
		              	<bem.FormView__label>
		              		{t('Created On')}
		                </bem.FormView__label>
										<bem.FormView__highlighted>                
		              		{formatTime(this.state.date_created)}
		              	</bem.FormView__highlighted>
	              	</bem.FormView__group>
	              	<bem.FormView__group>
		              	<bem.FormView__label>
		              		{t('Last Modified')}
		                </bem.FormView__label>
										<bem.FormView__highlighted>                
		              		{formatTime(this.state.date_modified)}
		              	</bem.FormView__highlighted>
	              	</bem.FormView__group>
	              	<bem.FormView__group>
		              	<bem.FormView__label>
		              		{t('Number of Questions')}
		                </bem.FormView__label>
										<bem.FormView__highlighted>                
		              		{this.state.content && 
		              			this.state.content.survey.length
		              		}
		              	</bem.FormView__highlighted>
		              </bem.FormView__group>
	              </bem.FormView__cell>
	          	</bem.FormView__row>

							<bem.FormView__row m='second-row'>
	              <bem.FormView__cell m='team'>
	                <bem.FormView__label m='title'>
	                  {t('Team Members')}
	                </bem.FormView__label>
	                	<bem.FormView__group m='team-member'>
	                		<img src={defaultGravatarImage} />
	                		<div>{this.state.owner__username}</div> 
		                	<div>{t('Owner')}</div>
	                	</bem.FormView__group>
	                	{this.state.team && 
	                		Object.keys(team).map(function(key) {
		                		return (<bem.FormView__group m='team-member'>
		                			<img src={team[key].avatar} />
		                			<div>{team[key].username}</div> 
		                			<div>{team[key].can}</div>
		                		</bem.FormView__group>)
											})
	                	}
	                
	              </bem.FormView__cell>
	              <bem.FormView__cell m='actions'>
	                Action buttons
	              </bem.FormView__cell>
	            </bem.FormView__row>
	          </bem.FormView__wrapper> 
	        </bem.FormView>
	      </DocumentTitle>
	      );
    } else {
    	return (
    		<DocumentTitle title={`${docTitle} | KoboToolbox`}>
    			<bem.FormView>
    				<bem.FormView__cell>
    					<bem.FormView__group>
    						{t('This form is not deployed, therefore it does not have a summary. ')}
    					</bem.FormView__group>
    				</bem.FormView__cell>
    			</bem.FormView>
    		</DocumentTitle>
    		);
    	
    }

  },
  componentDidUpdate() {
    mdl.upgradeDom();
  }

})

export default FormSummary;
