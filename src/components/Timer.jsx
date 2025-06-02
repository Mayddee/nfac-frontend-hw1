//I wrote all the logics and structure into one component haha , sorry)

'use client';
import React, { useState, useEffect } from 'react';
import './Timer.css';

const timeVariants = [10, 20, 30];

const Timer = () => {
  const [name, setName] = useState('');
  const [inputName, setInputName] = useState('');
  const [initialTime, setInitialTime] = useState(timeVariants[0]);
  const [secondsLeft, setSecondsLeft] = useState(timeVariants[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quote, setQuote] = useState('');
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [fireworks, setFireworks] = useState([]);
  const [attemptedOnce, setAttemptedOnce] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('name');
    if (savedName) {
      setName(savedName);
      setInputName(savedName);
      const savedCount = localStorage.getItem(`completed_${savedName}`) || 0;
      setCompletionCount(Number(savedCount));
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsRunning(false);
          setIsCompleted(true);
          setAttemptedOnce(true);
          const currentName = inputName.trim();
          const key = `completed_${currentName}`;
          const prevCount = Number(localStorage.getItem(key) || 0);
          const newCount = prevCount + 1;
          localStorage.setItem(key, String(newCount));
          setCompletionCount(newCount);
          playSound();
          triggerFirework();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const playSound = () => {
    const audio = new Audio('/fireworks-sound-280715.mp3');
    audio.volume = 0.7;
    audio.loop = true;
    audio.play();

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 4000);
  };

  const triggerFirework = () => {
    const newFireworks = Array.from({ length: 5 }).map(() => ({
      id: crypto.randomUUID(),
      top: `${Math.floor(Math.random() * 75 + 5)}%`,
      left: `${Math.floor(Math.random() * 90 + 5)}%`,
      size: [80, 100, 140][Math.floor(Math.random() * 3)],
    }));
    setFireworks(newFireworks);
    setTimeout(() => setFireworks([]), 3000);
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      const trimmed = inputName.trim();
      if (!trimmed) {
        alert('Please enter your name before starting the timer!');
        return;
      }
      if (trimmed !== name) {
        localStorage.setItem('name', trimmed);
        const count = Number(localStorage.getItem(`completed_${trimmed}`) || 0);
        setCompletionCount(count);
        setName(trimmed);
        setAttemptedOnce(false); // reset if name changed
      }

      setSecondsLeft(initialTime);
      setIsCompleted(false);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSecondsLeft(initialTime);
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showRandomQuote = async () => {
    setIsFetchingQuote(true);
    setQuote('Loading quote...');
    try {
      const res = await fetch('https://dummyjson.com/quotes/random');
      const data = await res.json();
      if (data?.quote && data?.author) {
        setQuote(`"${data.quote}" — ${data.author}`);
      } else {
        setQuote('Failed to load quote 😢');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote('An error occurred while loading quote.');
    } finally {
      setIsFetchingQuote(false);
    }
  };

  const progressPercent = ((initialTime - secondsLeft) / initialTime) * 100;

  return (
    <>
      <div className={`timerContainer ${fireworks.length ? 'animate-scale' : ''}`}>
        <input
          type="text"
          placeholder="Enter your name"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          className="nameInput"
          disabled={isRunning}
        />

        <div className="timeButtons">
          {timeVariants.map((time) => (
            <button
              key={time}
              onClick={() => {
                if (!isRunning) {
                  setInitialTime(time);
                  setSecondsLeft(time);
                }
              }}
              className={`timeButton ${initialTime === time ? 'active' : ''}`}
              disabled={isRunning}
            >
              {time} sec
            </button>
          ))}
        </div>

        {isRunning && name && (
          <div className="infoLine">
            Timer running for <strong>{name}</strong>, {secondsLeft} seconds left
          </div>
        )}

        <div className="controls">
          <button onClick={handleStartStop} className="button startBtn">
            {attemptedOnce && inputName === name ? 'Try Again' : 'Start'}
          </button>
          {secondsLeft !== 0 && (
            <button onClick={handleReset} className="button resetBtn">
              Reset
            </button>
          )}
        </div>

        <div className="progressBar">
          <div className="progress" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className={`timerDisplay ${isCompleted ? 'completed' : ''}`}>
          {isCompleted ? `You did it, ${name}! 💪` : formatTime(secondsLeft)}
        </div>

        <div className="quoteBlock">
          <button
            onClick={showRandomQuote}
            className="button quoteBtn"
            disabled={isFetchingQuote}
          >
            {isFetchingQuote ? 'Loading...' : 'Show Motivation'}
          </button>
          {quote && <p className="quote">{quote}</p>}
        </div>

        <div className="completionCount">
          Timers completed for <strong>{name}</strong>: <strong>{completionCount}</strong>
        </div>
      </div>

      {fireworks.map((fw) => (
        <img
          key={fw.id}
          src="/firework.gif"
          alt="firework"
          className="fireworkGif"
          style={{
            top: fw.top,
            left: fw.left,
            width: fw.size + 'px',
            height: fw.size + 'px',
          }}
        />
      ))}
    </>
  );
};

export default Timer;
