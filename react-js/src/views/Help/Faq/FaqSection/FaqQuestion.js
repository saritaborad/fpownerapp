import React from 'react';
import classNames from 'classnames';
import './FaqCategory.scss';

const FaqQuestion = ({ question, questionIndex, showAnswer, answer, answerToggle }) => (
  <div className="question-answer-wrapper" onClick={() => answerToggle(questionIndex)}>
    <div className="question-plus-minus-wrapper">
      <div className={classNames('plus-minus', { opened: showAnswer === questionIndex })}>
        {showAnswer === questionIndex ? '-' : '+'}
      </div>
      <p className="question">{question}</p>
    </div>
    <p className={classNames('answer', { opened: showAnswer === questionIndex })}>{answer}</p>
  </div>
);

export default FaqQuestion;
