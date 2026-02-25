import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './FiltersPanel.css';

const FiltersPanel = ({ filters, onChange }) => {
    // Local draft so we can batch changes with "Apply"
    const [draft, setDraft] = useState(filters);

    // Sync draft when parent filters change (e.g. on reset)
    const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

    const handleApply = () => onChange(draft);

    const handleReset = () => {
        const cleared = { startDate: null, endDate: null, ageGroup: '', gender: '' };
        setDraft(cleared);
        onChange(cleared);
    };

    // Build active-filter badge list
    const badges = [];
    if (filters.startDate) badges.push({ label: `From: ${filters.startDate.toISOString().slice(0, 10)}`, key: 'startDate' });
    if (filters.endDate) badges.push({ label: `To: ${filters.endDate.toISOString().slice(0, 10)}`, key: 'endDate' });
    if (filters.ageGroup) badges.push({ label: `Age: ${filters.ageGroup}`, key: 'ageGroup' });
    if (filters.gender) badges.push({ label: `Gender: ${filters.gender}`, key: 'gender' });

    const removeBadge = (key) => {
        const next = { ...filters, [key]: key === 'startDate' || key === 'endDate' ? null : '' };
        setDraft(next);
        onChange(next);
    };

    return (
        <div className="filters-card">
            <div className="filters-header">
                <h3 className="filters-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Filters
                </h3>
                <div className="filters-actions">
                    <button className="btn-apply" onClick={handleApply}>Apply</button>
                    <button className="btn-reset" onClick={handleReset}>Reset</button>
                </div>
            </div>

            <div className="filters-row">
                <div className="filter-group">
                    <label>Start Date</label>
                    <DatePicker
                        selected={draft.startDate}
                        onChange={(date) => update('startDate', date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Pick start date"
                        isClearable
                        className="form-input filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>End Date</label>
                    <DatePicker
                        selected={draft.endDate}
                        onChange={(date) => update('endDate', date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Pick end date"
                        isClearable
                        className="form-input filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Age Group</label>
                    <select
                        className="form-input filter-input"
                        value={draft.ageGroup}
                        onChange={(e) => update('ageGroup', e.target.value)}
                    >
                        <option value="">All ages</option>
                        <option value="under18">&lt; 18</option>
                        <option value="18-40">18 – 40</option>
                        <option value="over40">&gt; 40</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Gender</label>
                    <select
                        className="form-input filter-input"
                        value={draft.gender}
                        onChange={(e) => update('gender', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {badges.length > 0 && (
                <div className="filter-badges">
                    {badges.map((b) => (
                        <span className="badge" key={b.key}>
                            {b.label}
                            <button className="badge-remove" onClick={() => removeBadge(b.key)} aria-label={`Remove ${b.label}`}>×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FiltersPanel;
