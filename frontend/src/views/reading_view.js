import React from "react";
import PropTypes from 'prop-types';

import {getCookie, TimeIt} from "../common";
import './reading_view.css';

// enum representing which view to show in reading view
const VIEWS = {
    INSTRUCTIONS_NAME: 0,
    READING: 1,
    OVERVIEW: 2,
};

/*
 * Represents the actual Segment window
 */
class Segment extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const segment_lines = this.props.text.split("\r\n");
        return (
            <div
                className="segment my-3"
                ref={this.props.segment_ref}
                onScroll={this.props.handleScroll}
            >
                {segment_lines.map(
                    (line, k) => (<div className='my-3' key={k}>{line}</div>)
                )}
            </div>
        );
    }
}
Segment.propTypes = {
    text: PropTypes.string,
    handleScroll: PropTypes.func,
    segment_ref: PropTypes.shape({current: PropTypes.instanceOf(Element)})
};

class NavBar extends React.Component {
    render() {
        const on_last_segment_and_rereading =
            this.props.segment_num === this.props.document_segments.length - 1
            && this.props.rereading;

        return (
            <div className='m-3 align-content-center'>
                <div className="row">
                    <div className="col-2">
                        {this.props.segment_num > 0 &&
                        <button
                            className="btn btn-outline-dark"
                            onClick={() => this.props.prevSegment()}
                        >
                            Back
                        </button>
                        }
                    </div>
                    <div className="col-6 input-group">
                        <input
                            className="form-control "
                            type="text"
                            placeholder="Page #"
                            onChange={this.props.handleJumpToFieldChange}
                            onKeyDown={this.props.handleJumpToFieldKeyDown}
                        />
                        <button
                            className="btn btn-outline-dark form-control"
                            onClick={this.props.handleJumpToButton}
                            // Checks isNaN so that an empty string
                            // doesn't count as 0
                            disabled={Number.isNaN(this.props.jump_to_value) ||
                            !this.props.segments_viewed.includes(
                                this.props.jump_to_value)}
                        >
                            Jump
                        </button>
                    </div>
                    <div className="col-4">
                        {!on_last_segment_and_rereading
                            ? <button
                                className="btn btn-outline-dark"
                                onClick={() => this.props.nextSegment()}
                            >
                                {this.props.rereading ? 'Next' : 'Reread'}
                            </button>
                            : <button
                                className="btn btn-outline-dark"
                                onClick={() => this.props.toOverview()}
                            >
                                To Overview
                            </button>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
NavBar.propTypes = {
    document_segments: PropTypes.array,
    segment_num: PropTypes.number,
    jump_to_value: PropTypes.number,
    segments_viewed: PropTypes.array,
    rereading: PropTypes.bool,
    prevSegment: PropTypes.func,
    nextSegment: PropTypes.func,
    toOverview: PropTypes.func,
    handleJumpToFieldKeyDown: PropTypes.func,
    handleJumpToFieldChange: PropTypes.func,
    handleJumpToButton: PropTypes.func,
};

class OverviewView extends React.Component {
    render() {
        const full_document_text = [];
        this.props.all_segments.map((el) => full_document_text.push(el.text.split("\r\n")));
        const document_questions = this.props.document_questions;
        const overview_questions = this.props.overview_questions;
        const document_response_fields = this.props.buildQuestionFields(document_questions);
        const overview_response_fields = this.props.buildQuestionFields(overview_questions);

        return (
            <div className="row">
                <div className="col-8">
                    <div className="scroll-overview">
                        {full_document_text.map((segment_text_array) => (
                            segment_text_array.map((text, i) => (
                                <p key={i}>{text}</p>
                            ))
                        ))}
                    </div>
                </div>
                <div className="col-4 questions-overview">
                    <p><b>Document Questions</b></p>
                    {document_response_fields}
                    <p><b>Overview Questions</b></p>
                    {overview_response_fields}
                </div>
            </div>
        );
    }
}
OverviewView.propTypes = {
    all_segments: PropTypes.array,
    document_questions: PropTypes.array,
    overview_questions: PropTypes.array,
    buildQuestionFields: PropTypes.func,
};

export class InstructionsNameView extends React.Component {
    render() {
        return (
            <div className={"container"}>
                <div>
                    Do a close reading of the text by following
                    these steps:
                    Read each segment of the text one segment at a time, from
                    segment 1 to segment 5, while answering
                    questions for each segment along the way.
                    <ol>
                        <li>After your first reading of a segment, click the “reread”
                        button in order to access the questions for that particular
                        segment.</li>
                        <li>Provide an answer to each question posed for that segment,
                        including the two “common questions.”</li>
                        <li>After you finish answering the questions for that segment,
                        click the “next” button in order to access the next segment.</li>
                        <li>For each segment, highlight passages that provide evidence
                        to support your answer to common question #2.</li>
                    </ol>
                </div>
                <div className={"input-group"}>
                    <label>What is your name?</label>
                    <input
                        className={"form-control"}
                        type={"text"}
                        onChange={(e) => this.props.handleStudentName(e)}
                        required
                    />
                    <div className={"input-group-append"}>
                        <button
                            className={"btn btn-outline-dark "}
                            onClick={() => this.props.startReading()}
                        >
                            Start Reading
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
InstructionsNameView.propTypes = {
    handleStudentName: PropTypes.func,
    startReading: PropTypes.func,
};

export class ReadingView extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            current_view: VIEWS.INSTRUCTIONS_NAME,
            student_name: "",
            segment_num: 0,
            timer: null,
            scroll_top: 0,
            scroll_data: [],
            segments_viewed: [0],
            jump_to_value: null,
            rereading: false,  // we alternate reading and rereading
            document: null,
            reading_data: null,
            interval_timer: null,
            segmentQuestionNum: 0,
            segmentResponseArray: [],
            documentResponseArray: [],
        };
        this.csrftoken = getCookie('csrftoken');

        this.segment_ref = React.createRef();
        this.handleSegmentResponseChange = this.handleSegmentResponseChange.bind(this);
        this.prevSegment = this.prevSegment.bind(this);
        this.nextSegment = this.nextSegment.bind(this);
        this.toOverview = this.toOverview.bind(this);
        this.handleJumpToFieldChange = this.handleJumpToFieldChange.bind(this);
        this.handleJumpToButton = this.handleJumpToButton.bind(this);
        this.buildQuestionFields = this.buildQuestionFields.bind(this);
        this.startReading = this.startReading.bind(this);
        this.handleStudentName = this.handleStudentName.bind(this);
    }

    async startReading() {
        try {
            // Hard code the document we know exists for now -- generalize later...
            const url = '/api/documents/1/';
            const data = {
                name: this.state.student_name,
            };
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': this.csrftoken,
                }
            });
            const response_json = await response.json();
            const document = response_json.document;
            const reading_data = response_json.reading_data;
            const interval_timer = setInterval(() => this.recordScroll(), 2000);
            this.setState({
                document,
                interval_timer,
                reading_data,
                current_view: VIEWS.READING,
            });
            this.sendData(true);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * segment_data is an array of arrays. The index of each array
     * corresponds to the segment number of the segments and is updated
     * with new segment data every time the buttons are clicked
     */
    async sendData(firstTime){
        if (!firstTime) {
            const time = this.state.timer.stop();
            this.setState({scroll_data: []});
            const url = '/api/add-response/';
            const reading_data = {
                reading_data_id: this.state.reading_data.id,
                segment_data: [{
                    id: this.state.document.segments[this.state.segment_num].id,
                    scroll_data: JSON.stringify(this.state.scroll_data),
                    view_time: time,
                    is_rereading: this.state.rereading,
                    segment_responses: this.state.segmentResponseArray,
                }],
                document_responses: this.state.documentResponseArray,
            };
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(reading_data),
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': this.csrftoken,
                }
            });
            const new_reading_data = await response.json();
            this.setState({reading_data: new_reading_data});
        }
        const timer = new TimeIt();
        this.setState({timer});
    }

    recordScroll() {
        const scroll_data = this.state.scroll_data;
        scroll_data.push(this.state.scroll_top);
        this.setState({scroll_data});
    }

    handleScroll(e) {
        const scroll_top = e.target.scrollTop;
        this.setState({scroll_top});
    }

    /**
     * Allows the user to change their response to a segment question
     */
    handleSegmentResponseChange(question_id, event) {
        const segmentResponseArray = this.state.segmentResponseArray.slice();

        let question_entry = null;
        for (let el of segmentResponseArray) {
            if (el.id === question_id) {
                question_entry = el;
                break;
            }
        }

        if (question_entry === null) {
            question_entry = {id: question_id};
            segmentResponseArray.push(question_entry);
        }

        question_entry.response = event.target.value;

        this.setState({segmentResponseArray});
    }

    handleDocumentResponseChange(question_id, event) {
        const documentResponseArray = this.state.documentResponseArray.slice();

        let document_entry = null;
        for (let el of documentResponseArray) {
            if (el.id === question_id) {
                document_entry = el;
            }
        }

        if (document_entry === null) {
            document_entry = {id: question_id};
            documentResponseArray.push(document_entry);
        }

        document_entry.response = event.target.value;
        document_entry.response_segment = this.state.segment_num;

        this.setState({documentResponseArray});
    }

    prevSegment () {
        this.sendData(false);
        this.gotoSegment(this.state.segment_num - 1);
        this.segment_ref.current.scrollTo(0,0);
    }

    nextSegment () {
        this.sendData(false);

        if (this.state.rereading) {
            // If we're already rereading, move to the next segment
            this.gotoSegment(this.state.segment_num + 1);
            this.setState({segmentResponseArray: []})
            //TODO Figure out if this can be integrated into gotoSegment. I wasn't exactly
            // sure why it was being set here but not prevSegment().
        } else {
            // Otherwise, move on to the rereading layout
            this.setState({rereading: true});
        }

        this.segment_ref.current.scrollTo(0,0);
    }

    gotoSegment(segmentNum) {
        let segmentCount = this.state.document.segments.length;
        if (segmentNum >= 0 && segmentNum < segmentCount) {
            const segments_viewed = this.state.segments_viewed.slice();
            let rereading = segments_viewed.includes(segmentNum);

            //The segment number is pushed regardless of whether or not the user has read the page
            // before so that page reread order can also be determined.
            segments_viewed.push(segmentNum);
            this.setState({
                rereading,
                segments_viewed,
                segment_num: segmentNum,
                segmentQuestionNum: 0,
            });
        }
    }

    handleJumpToFieldKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.handleJumpToButton(); //The enter key should be treated the same the jump button
        }
    }

    handleJumpToFieldChange = (e) => {
        let numericValue = parseInt(e.target.value) - 1;
        this.setState({jump_to_value: numericValue});
    };

    handleJumpToButton = () => {
        this.gotoSegment(this.state.jump_to_value);
    };

    toOverview () {
        this.setState({current_view: VIEWS.OVERVIEW})
    }

    buildQuestionFields(questions, is_document_question) {
        return questions.map((question, id) => (
            <React.Fragment key={id}>
                <div className="mb-5 mx-5">
                    <div className='segment-question-text question-text'>
                        {question.text}
                    </div>
                    <textarea
                        className='form-control form-control-lg questions-boxes'
                        id="exampleFormControlTextarea1"
                        rows="4"
                        onChange={
                            is_document_question
                                ? this.handleDocumentResponseChange.bind(this, question.id)
                                : this.handleSegmentResponseChange.bind(this, question.id)
                        }
                    />
                </div>
            </React.Fragment>
        ));
    }

    handleStudentName(e) {
        this.setState({student_name: e.target.value});
    }

    render() {
        if (this.state.current_view === VIEWS.INSTRUCTIONS_NAME) {
            return (
                <InstructionsNameView
                    handleStudentName={this.handleStudentName}
                    startReading={this.startReading}
                />

            )
        }

        const doc = this.state.document;
        if (!doc) {
            return ( <div>Loading!</div> );
        }

        const current_segment = doc.segments[this.state.segment_num];
        const segment_questions = current_segment.questions;
        const document_questions = doc.document_questions;
        const overview_questions = doc.overview_questions;

        // Generate response fields for each of the questions
        const segment_response_fields = this.buildQuestionFields(segment_questions, false);
        const document_response_fields = this.buildQuestionFields(document_questions, true);

        return (
            <div className="container">
                <h1 className="display-4 py-3 pr-3">{doc.title}</h1>

                {this.state.current_view === VIEWS.OVERVIEW &&
                    <OverviewView
                        all_segments={doc.segments}
                        document_questions={document_questions}
                        overview_questions={overview_questions}
                        buildQuestionFields={this.buildQuestionFields}
                    />
                }
                {this.state.current_view === VIEWS.READING &&
                    <React.Fragment>
                        <div className="row">
                            <div className='col-sm-8 col-12'>
                                <div className='my-3'>
                                    Segment Number: {this.state.segment_num + 1}
                                </div>
                                <Segment
                                    text={current_segment.text}
                                    handleScroll={(e) => this.handleScroll(e)}
                                    segment_ref={this.segment_ref}
                                />
                                <NavBar
                                    document_segments={doc.segments}
                                    segment_num={this.state.segment_num}
                                    rereading={this.state.rereading}
                                    jump_to_value={this.state.jump_to_value}
                                    segments_viewed={this.state.segments_viewed}
                                    prevSegment={this.prevSegment}
                                    nextSegment={this.nextSegment}
                                    toOverview={this.toOverview}
                                    handleJumpToFieldChange={this.handleJumpToFieldChange}
                                    handleJumpToButton={this.handleJumpToButton}
                                    handleJumpToFieldKeyDown={this.handleJumpToFieldKeyDown}
                                />
                            </div>

                            {this.state.rereading &&
                                <div className="col-sm-4 col-12 my-3 my-sm-0 questions-overview">
                                    {document_response_fields}
                                    {segment_response_fields}
                                </div>
                            }
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}
