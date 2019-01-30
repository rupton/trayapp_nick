import React from 'react';
import View from '../components/View';
import Error from '../components/Error';
import Loading from '../components/Loading';

// Update to use Solutions
import { openConfigWindow } from '../lib/configWindow';
// Add ability to remove solution instance
import {
    listSolutions,
    listSolutionInstances,
    createSolutionInstance,
    deleteSolutionInstance,
    updateSolutionInstanceConfig,
} from '../api/solutions';

import './demo.css';

import config from '../config.js';

export class Demo extends React.PureComponent {
    state = {
        solutions: null,
        instances: null,
        loadinginstances: true,
        loadingSolutions: true,
    }

    componentDidMount() {
        fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                username: config.username,
                password: config.password,
            }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(() => {
            this.listSolutions();
            this.listInstances();
        });
    }

    calculateInstancesSize() {
        if (!this.state.instances || !this.state.instances.length) {
            return 0;
        }

        return 40 + this.state.instances.length * 18;
    }

    calculateSolutionSize() {
        if (!this.state.solutions || !this.state.solutions.length) {
            return 0;
        }

        return this.state.solutions.length * 30;
    }

    calculateSize() {
        const standardContentHeight = 129;
        return standardContentHeight + this.calculateInstancesSize() + this.calculateSolutionSize();
    }

    listSolutions = () => {
        listSolutions().then(({body}) => {
            this.setState({solutions: body.data, loadingSolutions: false});
        });
    }

    listInstances = () => {
        listSolutionInstances().then(({body}) => {
            this.setState({instances: body.data, loadinginstances: false});
        });
    }

    onClickActivateIntegration = (id, title) => {
        const configWindow = openConfigWindow();

        createSolutionInstance(id, title).then(({body}) => {
            // After we generate the popup URL, set it to the previously opened
            // window:
            configWindow.location = body.data.popupUrl;
            this.listInstances();
        });
    }

    onClickDeactivateIntegration = id => {
        deleteSolutionInstance(id).then(this.listInstances);
    }

    onReconfigureIntegration = id => {
        const configWindow = openConfigWindow();

        updateSolutionInstanceConfig(id).then(({body}) => {
            // After we generate the popup URL, set it to the previously opened
            // window:
            configWindow.location = body.data.popupUrl;
        });
    }

    renderSolutions() {
        return this.state.solutions && this.state.solutions.map(i => {
            return (
                <div className="integration-container">
                    <a className="integration-name" href="#">{i.title}</a>
                    <span
                        className="activate"
                        onClick={() => this.onClickActivateIntegration(i.id, i.title)}
                    >
                        Activate
                    </span>
                </div>
            );
        });
    }

    renderInstances() {
        if (!this.state.instances || !this.state.instances.length) return null;

        return (
            <div className="workflow-container">
                <div className="workflow-header">
                    <h3 className="app-name">App Name</h3>
                </div>

                {this.state.instances.map(w => {
                    return (
                        <div className="workflow-container">
                            <a
                                href="%"
                            >
                                {w.name}
                            </a>
                            <a
                                className="deactivate"
                                onClick={() => this.onClickDeactivateIntegration(w.id)}
                            >
                                Deactivate
                            </a>
                            <a
                                className="reconfigure"
                                onClick={() => this.onReconfigureIntegration(w.id)}
                            >
                                Reconfigure
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        const styles = {
            integrationContainer: {
                padding: '10px 0',
            },
        };

        window.parent.postMessage({
            type: 'tray_demo_size',
            height: this.calculateSize() + 'px',
        }, '*');

        return (
            <Loading loading={this.state.loadinginstances && this.state.loadingSolutions}>
                <div className="demo-container">
                    <div>
                        <h2 className="header">Available Integrations</h2>
                        {this.renderSolutions()}
                    </div>
                    <div>
                        <h2 className="header">Active Integrations</h2>

                        {this.state.instances && this.state.instances.length ?
                            <p>You have authorized the following applications with <a href="#">Asana Connect</a>.</p> :
                            <p>Applications you authorize with <a href="#">Asana Connect</a> will appear here.</p>
                        }

                        {this.renderInstances()}
                    </div>
                    <div className="footer">
                        <a href="#">Manage Developer Apps</a>
                    </div>
                </div>
            </Loading>
        );
    }
}

export default Demo;