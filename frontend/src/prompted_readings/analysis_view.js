import React from "react";
import PropTypes from 'prop-types';

class FrequencyFeelingTable extends React.Component {
    render() {
        return (
            <div>
                <h1>Frequency Feelings</h1>
                <table border="1">
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

class ContextVsViewTime extends React.Component {
    render() {
        const viewTimes = this.props.viewTime.map(time => Math.round(time * 1000) / 1000);
        return (
            <div>
                <h1>Ad View Time VS Story View Time</h1>
                <p>Average ad view time: {viewTimes[0]} seconds</p>
                <p>Average story view time: {viewTimes[1]} seconds</p>
            </div>
        )
    }
}

ContextVsViewTime.propTypes = {
    viewTime: PropTypes.array,
};

class AnalysisView extends React.Component {
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
            } = this.state.analysis;

            return (
                <div>
                    <h1>Analysis of Student Responses</h1>
                    <h3>Total view time</h3>
                    <p>{total_view_time} seconds</p>
                    <FrequencyFeelingTable feelings={frequency_feelings}/>
                    <ContextVsViewTime viewTime={context_vs_read_time}/>
                </div>
            );
        } else {
            return (
                <div>Loading!</div>
            );
        }
    }
}

export default AnalysisView;
