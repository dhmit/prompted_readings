import React from "react";
// import PropTypes from 'prop-types';

export class DocumentAnalysisView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // we initialize analysis to null, so we can check in render() whether
            // we've received a response from the server yet
            analysis: null,
        };
    }

    /**
     * This function is fired once this component has loaded into the DOM.
     * We send a request to the backend for the analysis data.
     */
    // async componentDidMount() {
    //     try {
    //         const response = await fetch('/api/analysis/');
    //         const analysis = await response.json();
    //         this.setState({analysis});
    //     } catch (e) {
    //         // For now, just log errors to the console.
    //         console.log(e);
    //     }
    // }

    render() {
        if (this.state.analysis !== null) {
            // const {
            //
            // } = this.state.analysis;
            return (
                <div className={"container"}>
                    <nav className={"navbar navbar-expand-lg"}>
                        <div className={"navbar-nav"}>
                            <a
                                className={"nav-link nav-item text-dark font-weight-bold"}
                                href={"#"}
                            >Overview</a>
                            <a
                                className={"nav-link nav-item text-dark font-weight-bold"}
                                href={"#"}
                            >Analysis</a>
                        </div>
                    </nav>
                    <h1
                        className={"text-center display-4"}
                        id={"page-title"}
                    >Analysis of Student Responses</h1>
                    <p>Analysis of Recitatif</p>
                </div>
            );
        } else {
            return (
                <div>Loading!</div>
            );
        }
    }
}
