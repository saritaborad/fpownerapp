import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoader } from 'components/common/Loader';
import Axios from 'axios';
import swal from 'sweetalert';
import Navigation from 'views/_PrivateLayout/Navigation';
import environment from '../../../environments/environment';
import FaqCategory from './FaqSection/FaqCategory';

const Faq = ({ setBackVisibility, setPageTitle }) => {
  const { t } = useTranslation('user');
  const [openedCategory, setOpenedCategory] = useState(null);
  const [pageDataFaq, setPageDataFaq] = useState('');
  const { setLoaderVisibility } = useLoader();
  const [showAnswer, setShowAnswer] = useState(null);

  const categoryToggle = (i) => {
    if (openedCategory === i) {
      return setOpenedCategory(null);
    }
    setOpenedCategory(i);
    setShowAnswer(null);
  };

  useEffect(() => {
    if (!pageDataFaq) {
      fetchFaq();
    }
    setBackVisibility(true);
    setPageTitle(t('FAQ'));
  }, []);

  const fetchFaq = () => {
    setLoaderVisibility(true);
    Axios.get(`${environment.ownerApi}/faq`)
      .then((res) => {
        setPageDataFaq(JSON.parse(res.data?.faq));
        setLoaderVisibility(false);
      })
      .catch(() => {
        swal(t('errorFaq'));
        setLoaderVisibility(false);
      });
  };

  return (
    <>
      <div className="container">
        {pageDataFaq && (
          <div>
            {Array.isArray(pageDataFaq?.questions_by_category) ? (
              pageDataFaq?.questions_by_category.map((item, index) => (
                <FaqCategory
                  showAnswer={showAnswer}
                  setShowAnswer={setShowAnswer}
                  categoryIndex={index}
                  key={item.questions_category}
                  category={item.questions_category}
                  categoryToggle={categoryToggle}
                  openedCategory={openedCategory}
                  pageDataFaq={pageDataFaq}
                  questionAndAnswer={item.question_and_answer}
                />
              ))
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
      <Navigation selected="help" />
    </>
  );
};

export default Faq;
