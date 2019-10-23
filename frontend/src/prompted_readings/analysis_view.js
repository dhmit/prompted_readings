import React from "react";
import PropTypes from 'prop-types';

export class FrequencyFeelingTable extends React.Component {
    render() {
        return (
            <div>
                <h1>Frequency Feelings</h1>
                <table border="1" cellPadding="5">
                    <tbody>
                        <tr>
                            <th>Word</th>
                            <th>Frequency</th>
                        </tr>
                        {this.props.feelings.map((el, i) => (
                            <tr key={i}>
                                <td>{el[0]}</td><td>{el[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}
FrequencyFeelingTable.propTypes = {
    feelings: PropTypes.array,
};

export class ContextVsViewTime extends React.Component {
    render() {
        const viewTimesList = Object.entries(this.props.viewTime);
        const roundedViewTimes = viewTimesList.map(context =>
            [context[0] , Math.round(context[1] * 1000) / 1000]);
        return (
            <div>
                <h1>Mean View Times of Different Contexts</h1>
                <table border="1" cellPadding="5">
                    <tbody>
                        <tr>
                            <th>Context</th>
                            <th>Mean View Time (seconds)</th>
                        </tr>
                        {roundedViewTimes.map((context, i) => (
                            <tr key={i}>
                                <td>{context[0]}</td>
                                <td>{context[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}
ContextVsViewTime.propTypes = {
    viewTime: PropTypes.object,
};

export class SentimentScores extends React.Component {
    render() {
        return (
            <div>
                <h3>Average Sentiment Among Students</h3>
                <h5>Positivity Score:</h5>
                <p>{this.props.sentiment_average}</p>
                <h5>Standard Deviation:</h5>
                <p>{this.props.sentiment_std}</p>
            </div>
        );
    }
}
SentimentScores.propTypes = {
    sentiment_average: PropTypes.number,
    sentiment_std: PropTypes.number,
};

export class AnalysisView extends React.Component {
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
    async componentDidMount() {
        try {
            const response = await fetch('/api/analysis/');
            const analysis = await response.json();
            this.setState({analysis});
        } catch (e) {
            // For now, just log errors to the console.
            console.log(e);
        }
    }

    render() {
        if (this.state.analysis !== null) {
            const {  // object destructuring:
                total_view_time,
                frequency_feelings,
                context_vs_read_time,
                question_sentiment_analysis,
                compute_median_view_time,
            } = this.state.analysis;
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
                    <h1>Total view time</h1>
                    <p>Total view time: {total_view_time} seconds</p>
                    <h1>Median View Time</h1>
                    <p>Median view time: {compute_median_view_time} seconds</p>
                    <FrequencyFeelingTable feelings={frequency_feelings}/>
                    <br/>
                    <ContextVsViewTime viewTime={context_vs_read_time}/>
                    <br/>
                    <SentimentScores
                        sentiment_average={question_sentiment_analysis[0]}
                        sentiment_std={question_sentiment_analysis[1]}
                    />
                </div>
            );
        } else {
            return (
                <div>Loading!</div>
            );
        }
    }
}

