/**
 * Smart Analytics Summary — Rule-based insights generator
 * Produces human-readable analytics insights without AI APIs.
 */

/**
 * Generate smart summary insights from analytics data
 * @param {object} params
 * @param {object} params.url - URL record with clicks, createdAt
 * @param {Array} params.dailyClicks - Array of { date, clicks }
 * @param {Array} params.recentVisits - Array of visit records
 * @param {number} params.totalClicks - Total click count
 * @param {string|null} params.lastVisited - Last visit timestamp
 * @returns {Array<{type: string, icon: string, title: string, message: string, color: string}>}
 */
const generateSmartSummary = ({ url, dailyClicks = [], recentVisits = [], totalClicks = 0, lastVisited = null }) => {
  const insights = [];
  const now = new Date();

  // --- 1. Engagement Level ---
  let engagementLevel, engagementMsg, engagementColor;
  if (totalClicks === 0) {
    engagementLevel = 'No Activity';
    engagementMsg = 'This link hasn\'t received any clicks yet. Share it to start tracking!';
    engagementColor = 'surface';
  } else if (totalClicks < 5) {
    engagementLevel = 'Low';
    engagementMsg = `Only ${totalClicks} click${totalClicks > 1 ? 's' : ''} so far. Consider sharing on more platforms.`;
    engagementColor = 'amber';
  } else if (totalClicks < 50) {
    engagementLevel = 'Moderate';
    engagementMsg = `${totalClicks} clicks — decent engagement. Keep sharing to grow further.`;
    engagementColor = 'cyan';
  } else if (totalClicks < 200) {
    engagementLevel = 'Good';
    engagementMsg = `${totalClicks} clicks — strong performance! This link is gaining traction.`;
    engagementColor = 'emerald';
  } else {
    engagementLevel = 'Excellent';
    engagementMsg = `${totalClicks} clicks — outstanding! This is a high-performing link.`;
    engagementColor = 'primary';
  }

  insights.push({
    type: 'engagement',
    icon: 'activity',
    title: `Engagement: ${engagementLevel}`,
    message: engagementMsg,
    color: engagementColor,
  });

  // --- 2. Peak Click Day ---
  if (dailyClicks.length > 0) {
    const peakDay = dailyClicks.reduce((max, day) =>
      day.clicks > max.clicks ? day : max, dailyClicks[0]
    );

    const peakDate = new Date(peakDay.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    insights.push({
      type: 'peak',
      icon: 'trending-up',
      title: 'Peak Day',
      message: `Best day was ${peakDate} with ${peakDay.clicks} click${peakDay.clicks > 1 ? 's' : ''}.`,
      color: 'primary',
    });
  }

  // --- 3. Last Active / Inactive Warning ---
  if (lastVisited) {
    const lastVisitDate = new Date(lastVisited);
    const diffMs = now - lastVisitDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeAgo;
    if (diffHours < 1) {
      timeAgo = 'less than an hour ago';
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    if (diffDays >= 14) {
      insights.push({
        type: 'inactive',
        icon: 'alert-triangle',
        title: 'Inactive Link',
        message: `No clicks in ${diffDays} days. This link may need re-sharing or could be obsolete.`,
        color: 'rose',
      });
    } else if (diffDays >= 7) {
      insights.push({
        type: 'slowing',
        icon: 'clock',
        title: 'Slowing Down',
        message: `Last click was ${timeAgo}. Activity is declining.`,
        color: 'amber',
      });
    } else {
      insights.push({
        type: 'active',
        icon: 'zap',
        title: 'Recently Active',
        message: `Last clicked ${timeAgo}. Link is still receiving traffic.`,
        color: 'emerald',
      });
    }
  }

  // --- 4. Growth Trend (last 7 days vs previous 7 days) ---
  if (dailyClicks.length >= 7) {
    const sorted = [...dailyClicks].sort((a, b) => new Date(a.date) - new Date(b.date));
    const last7 = sorted.slice(-7);
    const prev7 = sorted.slice(-14, -7);

    const last7Total = last7.reduce((sum, d) => sum + d.clicks, 0);
    const prev7Total = prev7.reduce((sum, d) => sum + d.clicks, 0);

    let trendTitle, trendMsg, trendColor;

    if (prev7Total === 0 && last7Total > 0) {
      trendTitle = 'New Growth';
      trendMsg = `${last7Total} clicks in the last 7 days — traffic is starting!`;
      trendColor = 'emerald';
    } else if (prev7Total > 0) {
      const changePercent = Math.round(((last7Total - prev7Total) / prev7Total) * 100);

      if (changePercent > 20) {
        trendTitle = 'Growing 📈';
        trendMsg = `Clicks up ${changePercent}% compared to the previous week (${prev7Total} → ${last7Total}).`;
        trendColor = 'emerald';
      } else if (changePercent < -20) {
        trendTitle = 'Declining 📉';
        trendMsg = `Clicks down ${Math.abs(changePercent)}% compared to the previous week (${prev7Total} → ${last7Total}).`;
        trendColor = 'rose';
      } else {
        trendTitle = 'Steady';
        trendMsg = `Traffic is stable week-over-week (${prev7Total} → ${last7Total} clicks).`;
        trendColor = 'cyan';
      }
    } else {
      trendTitle = 'No Trend Data';
      trendMsg = 'Not enough data to determine a trend yet.';
      trendColor = 'surface';
    }

    insights.push({
      type: 'trend',
      icon: 'bar-chart',
      title: trendTitle,
      message: trendMsg,
      color: trendColor,
    });
  }

  // --- 5. Link Age Insight ---
  if (url?.createdAt) {
    const createdDate = new Date(url.createdAt);
    const ageDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    if (ageDays === 0) {
      insights.push({
        type: 'age',
        icon: 'sparkles',
        title: 'Brand New',
        message: 'This link was created today. Give it time to gather data!',
        color: 'primary',
      });
    } else if (totalClicks > 0) {
      const avgPerDay = (totalClicks / Math.max(ageDays, 1)).toFixed(1);
      insights.push({
        type: 'age',
        icon: 'calculator',
        title: 'Average Rate',
        message: `Averaging ${avgPerDay} clicks per day over ${ageDays} day${ageDays > 1 ? 's' : ''}.`,
        color: 'cyan',
      });
    }
  }

  return insights;
};

module.exports = { generateSmartSummary };
