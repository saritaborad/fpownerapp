import React, { Component } from 'react';
import './Paginator.scss';

export class Paginator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      totalPages: 1,
    };
    this.itemsPerPage = 10;
  }

  componentDidMount() {
    this.props.onMount.then((data) => {
      this.itemsPerPage = data.itemsPerPage;
      this.setState({
        currentPage: 1,
        totalPages: this.calculateMaxPages(data.totalItems, data.itemsPerPage),
      });
    });
  }

  componentDidUpdate() {
    if (this.state.currentPage !== this.props.currentPage) {
      this.setState({
        currentPage: this.props.currentPage,
      });
    }
    if (
      this.state.totalPages !== this.calculateMaxPages(this.props.totalItems, this.itemsPerPage)
    ) {
      this.updateTotalPages(this.props.totalItems);
    }
  }

  onPrevClick() {
    this.props.onPageChange(this.state.currentPage - 1);
  }

  onNextClick() {
    this.props.onPageChange(this.state.currentPage + 1);
  }

  calculateMaxPages(totalItems) {
    return Math.ceil(totalItems / this.itemsPerPage);
  }

  updateTotalPages(totalItems) {
    this.setState({
      totalPages: this.calculateMaxPages(totalItems),
    });
  }

  render() {
    if (this.state.totalPages > 1) {
      return (
        <div className="paginator">
          <div
            className={`triangle triangle-left${this.state.currentPage <= 1 ? ' hidden' : ''}`}
            onClick={this.onPrevClick.bind(this)}
          />
          <span className="current-page">{this.state.currentPage}</span>
          <div
            className={`triangle triangle-right${
              this.state.totalPages <= this.state.currentPage ? ' hidden' : ''
            }`}
            onClick={this.onNextClick.bind(this)}
          />
        </div>
      );
    }

    return null;
  }
}
