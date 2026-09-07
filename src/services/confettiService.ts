import confetti from 'canvas-confetti';
import { audioService } from './audioService';

export interface CelebrationOptions {
  title?: string;
  subtitle?: string;
  xpGained?: number;
  gemsGained?: number;
  badge?: string;
  type?: 'lesson' | 'grammar' | 'exam' | 'streak' | 'levelup' | 'battle';
}

class ConfettiService {
  /**
   * Standard Celebration Fireworks & Side Cannons
   */
  public triggerCelebration(type: 'standard' | 'lesson' | 'grammar' | 'exam' | 'streak' | 'levelup' | 'battle' = 'standard') {
    audioService.playFanfareSound();

    try {
      if (type === 'exam' || type === 'levelup') {
        this.triggerMassiveFireworkShow();
      } else if (type === 'streak') {
        this.triggerStreakFlameBurst();
      } else if (type === 'grammar') {
        this.triggerGrammarStarBurst();
      } else {
        this.triggerSideCannons();
      }
    } catch (err) {
      console.warn('Confetti animation error:', err);
    }
  }

  /**
   * Left & Right Side Cannons shooting inwards
   */
  public triggerSideCannons() {
    const count = 120;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#4f46e5', '#6366f1', '#10b981', '#f59e0b'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#facc15', '#10b981', '#06b6d4'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#6366f1', '#a855f7'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  /**
   * Massive Fireworks Cascade for Exams & Level Ups
   */
  public triggerMassiveFireworkShow() {
    const end = Date.now() + 2.2 * 1000;
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6', '#fbbf24'];

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.4 + 0.2,
        },
        colors: colors,
        zIndex: 9999,
        disableForReducedMotion: true,
      });
    }, 280);
  }

  /**
   * Grammar specific Star & Indigo/Purple burst
   */
  public triggerGrammarStarBurst() {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.65, x: 0.5 },
      colors: ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#fbbf24'],
      shapes: ['star', 'circle'],
      scalar: 1.1,
      zIndex: 9999,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#4f46e5', '#10b981'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#8b5cf6', '#f59e0b'],
        zIndex: 9999,
      });
    }, 250);
  }

  /**
   * Streak / Fire Flame Celebration
   */
  public triggerStreakFlameBurst() {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#f97316', '#ef4444', '#eab308', '#f59e0b', '#fbbf24'],
      zIndex: 9999,
    });
  }
}

export const confettiService = new ConfettiService();
