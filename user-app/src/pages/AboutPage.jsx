import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import './Page.css';
import './AboutPage.css';

export default function AboutPage() {
    const { lang } = useLang();

    const team = [
        { name: 'Abebe Girma', role: 'CEO & Founder', img: '👨‍💼' },
        { name: 'Selam Tadesse', role: 'Head of Operations', img: '👩‍💼' },
        { name: 'Yonas Bekele', role: 'Lead Developer', img: '👨‍💻' },
        { name: 'Meron Alemu', role: 'Marketing Director', img: '👩‍🎨' },
    ];

    const values = [
        { icon: '🎯', titleKey: 'ap_mission_title', descKey: 'ap_mission_desc' },
        { icon: '👁️', titleKey: 'ap_vision_title', descKey: 'ap_vision_desc' },
        { icon: '💎', titleKey: 'ap_values_title', descKey: 'ap_values_desc' },
    ];

    const serve = [
        { icon: '🎪', titleKey: 'ap_organizers', descKey: 'ap_organizers_desc' },
        { icon: '🎟️', titleKey: 'ap_attendees', descKey: 'ap_attendees_desc' },
        { icon: '🏪', titleKey: 'ap_vendors', descKey: 'ap_vendors_desc' },
        { icon: '👷', titleKey: 'ap_staff', descKey: 'ap_staff_desc' },
    ];

    return (
        <div>
            <div className="page-hero ap-hero">
                <div className="page-hero-inner">
                    <h1>{t(lang, 'ap_title')} <span>EventSphere</span></h1>
                    <p>{t(lang, 'ap_subtitle')}</p>
                </div>
            </div>

            <div className="page-body">

                {/* Mission / Vision / Values */}
                <div className="ap-values">
                    {values.map((v, i) => (
                        <div key={i} className="ap-value-card">
                            <div className="ap-value-icon">{v.icon}</div>
                            <h3>{t(lang, v.titleKey)}</h3>
                            <p>{t(lang, v.descKey)}</p>
                        </div>
                    ))}
                </div>

                {/* Who we serve */}
                <div className="ap-serve-section">
                    <h2 className="ap-section-title">{t(lang, 'ap_who_serve')}</h2>
                    <div className="ap-serve-grid">
                        {serve.map((item, i) => (
                            <div key={i} className="ap-serve-card">
                                <div className="ap-serve-icon">{item.icon}</div>
                                <h4>{t(lang, item.titleKey)}</h4>
                                <p>{t(lang, item.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="ap-team-section">
                    <h2 className="ap-section-title">{t(lang, 'ap_team')}</h2>
                    <div className="ap-team-grid">
                        {team.map((m, i) => (
                            <div key={i} className="ap-team-card">
                                <div className="ap-team-avatar">{m.img}</div>
                                <div className="ap-team-name">{m.name}</div>
                                <div className="ap-team-role">{m.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="ap-cta">
                    <h2>{t(lang, 'ap_cta_title')}</h2>
                    <p>{t(lang, 'ap_cta_sub')}</p>
                    <div className="ap-cta-btns">
                        <Link to="/events" className="btn-purple">{t(lang, 'ap_cta_browse')}</Link>
                        <Link to="/register" className="btn-outline">{t(lang, 'ap_cta_create')}</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}