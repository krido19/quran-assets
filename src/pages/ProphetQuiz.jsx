import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import prophetsData from '../data/prophet-stories.json';

export default function ProphetQuiz() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [highScore, setHighScore] = useState(0);

    // Generate random questions
    useEffect(() => {
        const savedHighScore = localStorage.getItem('prophet_quiz_highscore') || 0;
        setHighScore(parseInt(savedHighScore));
        generateQuestions();
    }, [language]);

    const generateQuestions = () => {
        const newQuestions = [];
        const shuffled = [...prophetsData].sort(() => Math.random() - 0.5);

        // Question types
        for (let i = 0; i < 10; i++) {
            const prophet = shuffled[i % shuffled.length];
            const questionType = i % 4;

            if (questionType === 0) {
                // Miracle question
                const wrongAnswers = shuffled
                    .filter(p => p.id !== prophet.id)
                    .slice(0, 3)
                    .map(p => language === 'id' ? p.name_id : p.name_en);

                newQuestions.push({
                    question: language === 'id'
                        ? `Siapa nabi yang memiliki mukjizat: "${prophet.miracle_id}"?`
                        : `Which prophet had the miracle: "${prophet.miracle_en}"?`,
                    options: [...wrongAnswers, language === 'id' ? prophet.name_id : prophet.name_en]
                        .sort(() => Math.random() - 0.5),
                    answer: language === 'id' ? prophet.name_id : prophet.name_en,
                    type: 'miracle'
                });
            } else if (questionType === 1) {
                // Location question
                const wrongAnswers = shuffled
                    .filter(p => p.id !== prophet.id)
                    .slice(0, 3)
                    .map(p => p.location);

                newQuestions.push({
                    question: language === 'id'
                        ? `Di mana Nabi ${prophet.name_id} diutus?`
                        : `Where was Prophet ${prophet.name_en} sent?`,
                    options: [...wrongAnswers, prophet.location].sort(() => Math.random() - 0.5),
                    answer: prophet.location,
                    type: 'location'
                });
            } else if (questionType === 2) {
                // Arabic name question
                const wrongAnswers = shuffled
                    .filter(p => p.id !== prophet.id)
                    .slice(0, 3)
                    .map(p => p.name);

                newQuestions.push({
                    question: language === 'id'
                        ? `Apa nama Arab dari Nabi ${prophet.name_id}?`
                        : `What is the Arabic name of Prophet ${prophet.name_en}?`,
                    options: [...wrongAnswers, prophet.name].sort(() => Math.random() - 0.5),
                    answer: prophet.name,
                    type: 'arabic'
                });
            } else {
                // Ulul Azmi question
                const ululAzmi = prophetsData.filter(p => p.category.includes('ululAzmi'));
                const isUlulAzmi = prophet.category.includes('ululAzmi');

                newQuestions.push({
                    question: language === 'id'
                        ? `Apakah Nabi ${prophet.name_id} termasuk Ulul Azmi?`
                        : `Is Prophet ${prophet.name_en} among the Ulul Azmi?`,
                    options: [
                        language === 'id' ? 'Ya' : 'Yes',
                        language === 'id' ? 'Tidak' : 'No'
                    ],
                    answer: isUlulAzmi
                        ? (language === 'id' ? 'Ya' : 'Yes')
                        : (language === 'id' ? 'Tidak' : 'No'),
                    type: 'ululazmi'
                });
            }
        }

        setQuestions(newQuestions);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer);
        const correct = answer === questions[currentQuestion].answer;
        setIsCorrect(correct);

        if (correct) {
            setScore(score + 1);
        }

        // Move to next question after delay
        setTimeout(() => {
            if (currentQuestion + 1 < questions.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                const finalScore = correct ? score + 1 : score;
                if (finalScore > highScore) {
                    setHighScore(finalScore);
                    localStorage.setItem('prophet_quiz_highscore', finalScore.toString());
                }
                setShowResult(true);
            }
        }, 1500);
    };

    if (questions.length === 0) {
        return (
            <div className="view active" style={{ padding: '20px', textAlign: 'center' }}>
                <p>{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="view active" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '20px', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute', left: '20px', top: '20px',
                        background: 'var(--bg-card)', border: 'none', borderRadius: '12px',
                        width: '40px', height: '40px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', cursor: 'pointer'
                    }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <h1>
                    <i className="fa-solid fa-gamepad" style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
                    {language === 'id' ? 'Kuis Nabi' : 'Prophet Quiz'}
                </h1>

                {/* High Score */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(234, 179, 8, 0.2)', color: '#eab308',
                    padding: '6px 15px', borderRadius: '20px', fontSize: '14px'
                }}>
                    <i className="fa-solid fa-trophy"></i>
                    {language === 'id' ? 'Skor Tertinggi' : 'High Score'}: {highScore}/10
                </div>
            </div>

            {!showResult ? (
                <div style={{ padding: '0 20px' }}>
                    {/* Progress */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '20px'
                    }}>
                        <span style={{ fontSize: '14px', opacity: 0.7 }}>
                            {language === 'id' ? 'Pertanyaan' : 'Question'} {currentQuestion + 1}/10
                        </span>
                        <span style={{
                            background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                            padding: '5px 12px', borderRadius: '15px', fontSize: '14px'
                        }}>
                            {language === 'id' ? 'Skor' : 'Score'}: {score}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                        background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
                        height: '6px', marginBottom: '25px', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${((currentQuestion + 1) / 10) * 100}%`,
                            height: '100%', background: 'var(--primary)',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>

                    {/* Question Card */}
                    <div style={{
                        background: 'var(--bg-card)', padding: '25px',
                        borderRadius: '20px', marginBottom: '20px'
                    }}>
                        <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0 }}>
                            {questions[currentQuestion].question}
                        </p>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {questions[currentQuestion].options.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isAnswer = option === questions[currentQuestion].answer;

                            let bgColor = 'var(--bg-card)';
                            let borderColor = 'transparent';

                            if (selectedAnswer !== null) {
                                if (isAnswer) {
                                    bgColor = 'rgba(16, 185, 129, 0.2)';
                                    borderColor = '#10b981';
                                } else if (isSelected && !isCorrect) {
                                    bgColor = 'rgba(239, 68, 68, 0.2)';
                                    borderColor = '#ef4444';
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={selectedAnswer !== null}
                                    style={{
                                        background: bgColor,
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '15px', padding: '18px',
                                        textAlign: 'left', cursor: selectedAnswer ? 'default' : 'pointer',
                                        color: 'var(--text-main)', fontSize: '16px',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: 'bold'
                                    }}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span style={{
                                        fontFamily: questions[currentQuestion].type === 'arabic'
                                            ? 'Amiri, serif' : 'inherit',
                                        fontSize: questions[currentQuestion].type === 'arabic' ? '20px' : '16px'
                                    }}>
                                        {option}
                                    </span>
                                    {selectedAnswer !== null && isAnswer && (
                                        <i className="fa-solid fa-check" style={{ marginLeft: 'auto', color: '#10b981' }}></i>
                                    )}
                                    {selectedAnswer !== null && isSelected && !isCorrect && (
                                        <i className="fa-solid fa-xmark" style={{ marginLeft: 'auto', color: '#ef4444' }}></i>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Result Screen */
                <div style={{ padding: '0 20px', textAlign: 'center' }}>
                    <div style={{
                        background: 'var(--bg-card)', padding: '40px',
                        borderRadius: '20px'
                    }}>
                        {/* Trophy/Result Icon */}
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            margin: '0 auto 20px',
                            background: score >= 8
                                ? 'linear-gradient(135deg, #eab308, #fbbf24)'
                                : score >= 5
                                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                                    : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <i className={`fa-solid ${score >= 8 ? 'fa-trophy' : score >= 5 ? 'fa-medal' : 'fa-star'}`}
                                style={{ fontSize: '40px', color: 'white' }}></i>
                        </div>

                        <h2 style={{ margin: '0 0 10px' }}>
                            {score >= 8
                                ? (language === 'id' ? 'Luar Biasa!' : 'Excellent!')
                                : score >= 5
                                    ? (language === 'id' ? 'Bagus!' : 'Good Job!')
                                    : (language === 'id' ? 'Terus Belajar!' : 'Keep Learning!')}
                        </h2>

                        <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: 'var(--primary)' }}>
                            {score}/10
                        </p>

                        <p style={{ opacity: 0.7, marginBottom: '30px' }}>
                            {language === 'id'
                                ? `Anda menjawab ${score} pertanyaan dengan benar!`
                                : `You answered ${score} questions correctly!`}
                        </p>

                        {score > highScore - 1 && score === highScore && (
                            <div style={{
                                background: 'rgba(234, 179, 8, 0.2)', color: '#eab308',
                                padding: '10px 20px', borderRadius: '10px',
                                marginBottom: '20px', display: 'inline-flex',
                                alignItems: 'center', gap: '8px'
                            }}>
                                <i className="fa-solid fa-crown"></i>
                                {language === 'id' ? 'Skor Tertinggi Baru!' : 'New High Score!'}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                            <button
                                onClick={generateQuestions}
                                style={{
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '12px', padding: '15px 30px',
                                    cursor: 'pointer', fontSize: '16px',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <i className="fa-solid fa-rotate-right"></i>
                                {language === 'id' ? 'Main Lagi' : 'Play Again'}
                            </button>
                            <button
                                onClick={() => navigate('/prophet-stories')}
                                style={{
                                    background: 'var(--bg-card)', color: 'var(--text-main)',
                                    border: '2px solid var(--primary)', borderRadius: '12px',
                                    padding: '15px 30px', cursor: 'pointer', fontSize: '16px'
                                }}
                            >
                                {language === 'id' ? 'Pelajari Lagi' : 'Study Again'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
