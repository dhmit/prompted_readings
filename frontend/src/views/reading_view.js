import React from "react";
import {TimeIt, handleStoryScroll} from "../common";
import './reading_view.css';
import PropTypes from 'prop-types';

class Segment extends React.Component {
    render() {
        return (
            <div className="scroll">
                <p>Segment Number: {this.props.segment_num + 1}</p>
                {this.props.segment_lines.map((line, k) => (
                    <p key={k}>{line}</p>)
                )}
            </div>
        )
    }
}
Segment.propTypes = {
    segment_lines: PropTypes.array,
    segment_num: PropTypes.number,
};


class OverviewWindow extends React.Component {
    render() {
        return (
            <div className={"row"}>
                <div className={"col-8"}>
                    <div className="scroll_overview">
                        {this.props.all_segments.map((el, i) => (
                            <p key={i}>{el.text}</p>)
                        )}
                    </div>
                </div>
                <div className={"col-4"}>
                    <p><b>Overview Questions</b></p>
                    {this.props.document_questions.map((el, i) => (
                        <p key={i}>{el.text}</p>)
                    )}
                </div>
            </div>
        );
    }
}

OverviewWindow.propTypes = {
    all_segments: PropTypes.array,
    document_questions: PropTypes.array,
};


class ReadingView extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            segment_num: 71,
            timer: null,
            segment_data: [],
            scrollTop: 0,
            scroll_ups: 0,
            scrolling_up: false,
            rereading: false,  // we alternate reading and rereading
            document: null,
        }
    }

    /**
     * segment_read_times is a array of arrays. The index of each array
     * corresponds to the segment number of the segments and is updated
     * with a new time every time the buttons are clicked
     */
    updateData(firstTime){
        if (!firstTime) {
            const segment_data = this.state.segment_data;
            const time = this.state.timer.stop();
            segment_data.push({
                scroll_ups: this.state.scroll_ups,
                read_time: time,
                is_rereading: this.state.rereading,
                segment_num: this.state.segment_num
            });
            this.setState({segment_data, scroll_ups: -1});
        }
        const timer = new TimeIt();
        this.setState({timer});
    }

    // We have the big arrow notation here to bind "this" to this function
    handleScroll = (e) => {
        this.setState(handleStoryScroll(e, this.state.scrollTop, this.state.scroll_ups,
            this.state.scrolling_up));
    };

    prevSegment () {
        this.updateData(false);
        this.setState({segment_num: this.state.segment_num-1});
        window.scrollTo(0,0);
    }

    nextSegment () {
        this.updateData(false);
        if (this.state.rereading) {
            // If we're already rereading, move to the next segment
            this.setState({rereading: false, segment_num: this.state.segment_num+1});
        } else {
            // Otherwise, move on to the rereading layout
            this.setState({rereading: true});
        }
        window.scrollTo(0,0);
    }

    toOverview () {
        this.setState({overview: true})
    }

    async componentDidMount() {
        try {
            // Hard code the document we know exists for now,
            // Generalize later...
            const response = await fetch('/api/documents/1');
            const document = await response.json();
            this.setState({document});
            this.updateData(true);
            // This will allow the scroll detector to work
            /** TODO: Add event listener to the reading pane when it is complete to track scroll
             *        data on that reading pane only. Currently, it is tracking scrolling data
             *        for entire page
             */
            window.addEventListener('scroll', this.handleScroll, true);
        } catch (e) {
            console.log(e);
        }

    }

    render() {
        const doc = this.state.document;

        if (doc) {
            const document_length = doc.segments.length;
            const current_segment = doc.segments[this.state.segment_num];
            const segment_text = current_segment.text;
            const segment_lines = segment_text.split("\r\n");
            const segment_questions = current_segment.questions;
            const segment_contexts = current_segment.contexts;
            const all_segments = doc.segments;
            const document_questions = doc.questions;

            return (
                <div className={"container"}>
                    <h1 className={"display-4 py-3 pr-3"}>{doc.title}</h1>

                    {this.state.overview ?
                        <OverviewWindow
                            all_segments={all_segments}
                            document_questions={document_questions}
                        />
                        :
                        <div className={"row"}>
                            <div className={'col-8'}>
                                <Segment
                                    segment_lines={segment_lines}
                                    segment_num={this.state.segment_num}
                                />
                                <button
                                    className={"btn btn-outline-dark mr-2"}
                                    onClick={() => this.prevSegment()}
                                >
                                    Back
                                </button>
                                {this.state.segment_num < document_length - 1 ?
                                    <button
                                        className={"btn btn-outline-dark"}
                                        onClick={() => this.nextSegment()}
                                    >
                                        {this.state.rereading ? 'Next' : 'Reread'}
                                    </button> :
                                    <button
                                        className={"btn btn-outline-dark"}
                                        onClick={() => this.toOverview()}
                                    >
                                        To Overview
                                    </button>
                                }
                            </div>

                            {this.state.rereading &&
                                <div className={"analysis col-4"}>
                                    <p><b>Context: </b></p>
                                    {segment_contexts.map((el,i) =>
                                        <ul key={i}>
                                            <li>{el.text}</li>
                                        </ul>)}
                                    <p><b>Questions: </b></p>
                                    {segment_questions.map((el,i) =>
                                        <ul key={i}>
                                            <li>{el.text}</li>
                                        </ul>
                                    )}
                                    {document_questions && (
                                        <div>
                                            <p><b>Document Questions: </b></p>
                                            {document_questions.map((el,i) =>
                                                <ul key={i}>
                                                    <li>{el.text}</li>
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    <p>
                                        <b>Add an annotation: </b><input
                                            type="text"
                                            value={this.state.value}
                                            onChange={this.handleChange}
                                        /><button>Submit</button>
                                    </p>
                                </div>
                            }
                        </div>
                    }

                </div>
            );
        } else {
            return (
                <div>Loading!</div>
            );
        }

    }
}

export default ReadingView;
