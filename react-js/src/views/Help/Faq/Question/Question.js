import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import './Question.scss';

const Question = ({ index, question, answer }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={
            <FontAwesomeIcon icon={visible ? faMinus : faPlus} className="Font-awesome-icon" />
          }
          id={`faq-question-${index}`}
          onClick={() => setVisible((prevState) => !prevState)}
        >
          <Typography className="question">{question}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography className="answer">{answer}</Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <hr className="nav-line" />
    </>
  );
};

export default Question;
