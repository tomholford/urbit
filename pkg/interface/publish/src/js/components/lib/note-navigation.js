import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';


export class NoteNavigation extends Component {
  constructor(props) {
    super(props)
  }
  render() {

    let nextComponent = null;
    let prevComponent = null;
    let nextUrl = ''
    let prevUrl = ''

    if (this.props.next && this.props.prev) {
      nextUrl = `/~publish/note/${this.props.ship}/${this.props.book}/${this.props.next.id}`;
      prevUrl = `/~publish/note/${this.props.ship}/${this.props.book}/${this.props.prev.id}`;
      nextComponent =
      <Link to={nextUrl} className="di flex-column tr w-100 pv6 bt bb b--gray3">
        <div className="f9 gray2 mb2">Next</div>
        <div className="f9 mb1">{this.props.next.title}</div>
        <div className="f9 gray2">{this.props.next.date}</div>
      </Link>

      prevComponent =
      <Link to={prevUrl} className="di flex-column w-100 pv6 bt br bb b--gray3">
        <div className="f9 gray2 mb2">Previous</div>
        <div className="f9 mb1">{this.props.prev.title}</div>
        <div className="f9 gray2">{this.props.prev.date}</div>
      </Link>

    } else if (this.props.prev) {
      prevUrl = `/~publish/note/${this.props.ship}/${this.props.book}/${this.props.prev.id}`;
      prevComponent =
      <Link to={prevUrl} className="di flex-column w-100 pv6 bt bb b--gray3">
        <div className="f9 gray2 mb2">Previous</div>
        <div className="f9 mb1">{this.props.prev.title}</div>
        <div className="f9 gray2">{this.props.prev.date}</div>
      </Link>
    } else if (this.props.next) {
      nextUrl = `/~publish/note/${this.props.ship}/${this.props.book}/${this.props.next.id}`;
      nextComponent =
      <Link to={nextUrl} className="di flex-column tr w-100 pv6 bt bb b--gray3">
        <div className="f9 gray2 mb2">Next</div>
        <div className="f9 mb1">{this.props.next.title}</div>
        <div className="f9 gray2">{this.props.next.date}</div>
      </Link>

    }

    return (
        <div className="flex pt4">
          {prevComponent}
          {nextComponent}
        </div>
    )
  }
}

export default NoteNavigation
