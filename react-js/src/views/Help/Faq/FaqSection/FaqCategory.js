import React from 'react';
import './FaqCategory.scss';
import classNames from 'classnames';
import FaqQuestion from './FaqQuestion';

const FaqCategory = ({
  setShowAnswer,
  showAnswer,
  categoryIndex,
  openedCategory,
  category,
  categoryToggle,
  questionAndAnswer,
}) => {
  const answerToggle = (i) => {
    if (showAnswer === i) {
      return setShowAnswer(null);
    }
    setShowAnswer(i);
  };

  return (
    <>
      <div onClick={() => categoryToggle(categoryIndex)} className="faq-container">
        {category}
        <div className="column-arrow">
          <i
            className={classNames('icon icon-arrow', {
              opened: openedCategory === categoryIndex,
            })}
          />
        </div>
      </div>
      <div
        className={classNames('category-questions-wrapper', {
          opened: openedCategory === categoryIndex,
        })}
      >
        {questionAndAnswer.map((item, index) => (
          <FaqQuestion
            key={item.question}
            answerToggle={answerToggle}
            showAnswer={showAnswer}
            question={item.question}
            answer={item.answer}
            questionIndex={index}
          />
        ))}
      </div>
    </>
  );
};

export default FaqCategory;
