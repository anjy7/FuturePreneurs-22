import React, { useEffect, useState } from "react";
import styles from "../../styles/QuestionsMatch.module.css";
import { memo } from "react";

function MatchingType({ question, answers, userAnswer, setUserAnswer }) {
  const [answerByUser, setAnswerByUser] = useState([]);
  // const [toSendAnswer, setToSendAnswer] = useState([]);
  const [userQuestion, setUserQuestion] = useState([]);
  // const [position, setPosition] = useState();
  const toSendAnswer = [];
  const [test, settest] = useState(true);

  function handleQuestionClick(number) {
    if (userQuestion.indexOf(number) !== -1) {
      HandleDoubleClick(userQuestion.indexOf(number));
      settest(!test);
    } else {
      if (userQuestion.length === answerByUser.length) {
        setUserQuestion((prevUserQuestion) => [...prevUserQuestion, number]);
        settest(!test);
      }
    }
  }

  function handleAnswerClick(number) {
    if (answerByUser.length === question.length) {
      settest(!test);

      if (answerByUser.indexOf(number) === -1) {
        // console.log("Checking");
        setAnswerByUser((prevAnswerByUser) => {
          prevAnswerByUser.splice(-1, 1, number);
          return prevAnswerByUser;
        });
      }
    } else {
      if (answerByUser.indexOf(number) !== -1) {
        return;
      }
      if (answerByUser.length + 1 === userQuestion.length) {
        setAnswerByUser((prevAnswerByUser) => [...prevAnswerByUser, number]);
        settest(!test);
      }
    }
  }

  function HandleDoubleClick(positioner) {
    answerByUser.splice(positioner, 1);
    userQuestion.splice(positioner, 1);
  }
  // console.log(toSendAnswer);
  useEffect(() => {
    // console.log("UseEffect Called");
    if (
      answerByUser.length === userQuestion.length &&
      answerByUser.length > 0 &&
      userQuestion.length > 0
    ) {
      if (answerByUser.length === question.length) {
        for (let i = 0; i < question.length; i++) {
          toSendAnswer.push(answerByUser[userQuestion.indexOf(i)]);
        }
        // console.log(toSendAnswer);
        setUserAnswer(toSendAnswer);
      } else {
        setUserAnswer(answerByUser);
        // console.log(toSendAnswer);
      }
    }
  }, [answerByUser, userQuestion, test]);

  useEffect(() => {
    if (userAnswer.length === 0) {
      // console.log("Hua Call");
      setUserQuestion([]);
      setAnswerByUser([]);
    }
  }, [userAnswer]);

  return (
    <div>
      <div style={{ color: "#ffff" }} className={styles.para}>
        Instructions: First select the question and then its corresponding
        answer. Both the entities will be highlighted with the same colour after
        this is done. Repeat the process for all the options in the question.
      </div>
      <section className={styles.section}>
        <div className={styles.match_list}>
          {question.map((ques) => {
            return (
              <div key={ques}>
                <div
                  className={styles.quesans}
                  onClick={() => {
                    // console.log("clicked");
                    // console.log(question.indexOf(ques));

                    handleQuestionClick(question.indexOf(ques));
                    // console.log(userQuestion.indexOf(ques));
                  }}
                >
                  <div
                    className={
                      styles[
                        `dot${userQuestion.indexOf(question.indexOf(ques))}`
                      ]
                    }
                  ></div>
                  ;<span className={styles.quest}>{ques}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.option_list}>
          {answers.map((ans) => {
            return (
              <div
                key={ans}
                className={styles.quesans}
                onClick={() => {
                  // console.log("clicked");
                  handleAnswerClick(answers.indexOf(ans));
                }}
              >
                <div
                  className={
                    styles[`dot${answerByUser.indexOf(answers.indexOf(ans))}`]
                  }
                ></div>
                <span className={styles.answ}>{ans}</span>
              </div>
            );
          })}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export default memo(MatchingType);
