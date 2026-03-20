import { describe, it, expect } from 'vitest';
import { workExperience, education, jobStartDate, jobEndDate, timelineJobs, primaryEducation, type WorkExperience, type Education } from './career';

// ISO date string: YYYY-MM-DD
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

describe('workExperience', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(workExperience)).toBe(true);
    expect(workExperience.length).toBeGreaterThan(0);
  });

  it('every entry has required string fields', () => {
    for (const job of workExperience) {
      expect(typeof job.title).toBe('string');
      expect(job.title.length).toBeGreaterThan(0);

      expect(typeof job.company).toBe('string');
      expect(job.company.length).toBeGreaterThan(0);

      expect(typeof job.location).toBe('string');
      expect(job.location.length).toBeGreaterThan(0);

      expect(typeof job.description).toBe('string');
      expect(job.description.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a non-empty goals array', () => {
    for (const job of workExperience) {
      expect(Array.isArray(job.goals)).toBe(true);
      expect(job.goals.length).toBeGreaterThan(0);
      for (const goal of job.goals) {
        expect(typeof goal).toBe('string');
        expect(goal.length).toBeGreaterThan(0);
      }
    }
  });

  it('every entry has a boolean currentJob field', () => {
    for (const job of workExperience) {
      expect(typeof job.currentJob).toBe('boolean');
    }
  });

  it('at most one job is marked as currentJob', () => {
    const current = workExperience.filter((job) => job.currentJob);
    expect(current.length).toBeLessThanOrEqual(1);
  });

  it('startDate, when present, matches ISO date format YYYY-MM-DD', () => {
    for (const job of workExperience) {
      if (job.startDate !== undefined) {
        expect(job.startDate).toMatch(ISO_DATE_RE);
      }
    }
  });

  it('endDate, when present, matches ISO date format YYYY-MM-DD', () => {
    for (const job of workExperience) {
      if (job.endDate !== undefined) {
        expect(job.endDate).toMatch(ISO_DATE_RE);
      }
    }
  });

  it('endDate is chronologically after startDate when both are present', () => {
    for (const job of workExperience) {
      if (job.startDate !== undefined && job.endDate !== undefined) {
        expect(new Date(job.endDate).getTime()).toBeGreaterThan(
          new Date(job.startDate).getTime()
        );
      }
    }
  });

  it('current job has no endDate', () => {
    for (const job of workExperience) {
      if (job.currentJob) {
        expect(job.endDate).toBeUndefined();
      }
    }
  });
});

describe('education', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(education)).toBe(true);
    expect(education.length).toBeGreaterThan(0);
  });

  it('every entry has required string fields', () => {
    for (const entry of education) {
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);

      expect(typeof entry.school).toBe('string');
      expect(entry.school.length).toBeGreaterThan(0);

      expect(typeof entry.location).toBe('string');
      expect(entry.location.length).toBeGreaterThan(0);
    }
  });

  it('endDate, when present, matches ISO date format YYYY-MM-DD', () => {
    for (const entry of education) {
      if (entry.endDate !== undefined) {
        expect(entry.endDate).toMatch(ISO_DATE_RE);
      }
    }
  });

  it('currentUni, when present, is a boolean', () => {
    for (const entry of education) {
      if (entry.currentUni !== undefined) {
        expect(typeof entry.currentUni).toBe('boolean');
      }
    }
  });
});

describe('career accessors', () => {
  const jobWithDates: WorkExperience = {
    title: 'Engineer',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    company: 'Acme',
    location: 'TX',
    description: 'Did things',
    goals: ['goal 1'],
    currentJob: false,
  };

  const jobNoDates: WorkExperience = {
    title: 'Engineer',
    company: 'Acme',
    location: 'TX',
    description: 'Did things',
    goals: ['goal 1'],
    currentJob: true,
  };

  describe('jobStartDate', () => {
    it('returns a Date when startDate is set', () => {
      const result = jobStartDate(jobWithDates);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCFullYear()).toBe(2024);
    });

    it('returns null when startDate is undefined', () => {
      expect(jobStartDate(jobNoDates)).toBeNull();
    });
  });

  describe('jobEndDate', () => {
    it('returns a Date when endDate is set', () => {
      const result = jobEndDate(jobWithDates);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCFullYear()).toBe(2024);
    });

    it('returns null when endDate is undefined', () => {
      expect(jobEndDate(jobNoDates)).toBeNull();
    });
  });

  describe('timelineJobs', () => {
    it('returns at most 3 entries', () => {
      expect(timelineJobs().length).toBeLessThanOrEqual(3);
    });

    it('returns the first entries from workExperience', () => {
      const jobs = timelineJobs();
      for (let i = 0; i < jobs.length; i++) {
        expect(jobs[i]).toBe(workExperience[i]);
      }
    });
  });

  describe('primaryEducation', () => {
    it('returns the first education entry when array is non-empty', () => {
      if (education.length > 0) {
        expect(primaryEducation()).toBe(education[0]);
      }
    });

    it('returns null or Education — never throws', () => {
      expect(() => primaryEducation()).not.toThrow();
      const result = primaryEducation();
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });
});
