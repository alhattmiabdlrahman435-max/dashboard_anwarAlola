import { api } from '../api';

export const backupsService = {
  /**
   * Get list of backups and statistics
   */
  async getBackups() {
    return api.get('/api/backups');
  },

  /**
   * Trigger immediate manual backup
   * @param {boolean} onlyDb - true for database only, false for full
   */
  async createBackup(onlyDb = true) {
    return api.post('/api/backups', { only_db: onlyDb });
  },

  /**
   * Export standalone full academic year archive (Excel, ZIP, or HTML)
   * @param {string} academicYear
   * @param {string|boolean} formatOrAsZip - 'excel' | 'zip' | 'html' or boolean
   */
  async exportAcademicYearArchive(academicYear = '2026-2027م', formatOrAsZip = 'excel') {
    let format = 'excel';
    if (typeof formatOrAsZip === 'boolean') {
      format = formatOrAsZip ? 'zip' : 'html';
    } else if (typeof formatOrAsZip === 'string') {
      format = formatOrAsZip;
    }

    return api.post('/api/backups/academic-year-archive', {
      academic_year: academicYear,
      format: format,
      as_zip: format === 'zip',
    });
  },

  /**
   * Clean old backups according to retention policy
   */
  async cleanBackups() {
    return api.post('/api/backups/clean');
  },

  /**
   * Delete a specific backup file
   * @param {string} fileName
   */
  async deleteBackup(fileName) {
    return api.delete(`/api/backups/${encodeURIComponent(fileName)}`);
  },

  /**
   * Download a backup zip or html file directly
   * @param {string} fileName
   */
  async downloadBackup(fileName) {
    const token = localStorage.getItem('auth_token');
    const url = `/api/backups/${encodeURIComponent(fileName)}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    // Attempt direct authenticated fetch with blob for cleaner browser handling
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: direct window download via query token link
      window.open(url, '_blank');
    }
  },
};
