'use client'

import type { UIFieldClientComponent } from 'payload'

import React from 'react'

import { THEME_TOKEN_GROUPS } from '@/lib/theme-tokens'

import { themeCssVarStyle, useThemeColorValues } from './use-theme-colors'

/** Live mock of the site chrome, driven by the colours in the form. */
export const ThemePreview: UIFieldClientComponent = () => {
  const colors = useThemeColorValues()
  const style = themeCssVarStyle(colors)

  return (
    <div className="bw-appearance-block">
      <div className="bw-appearance-block__head">
        <h3 className="bw-appearance-block__title">Podgląd motywu</h3>
        <p className="bw-appearance-block__lead">
          Podgląd reaguje na zmiany kolorów od razu, przed zapisem.
        </p>
      </div>

      <div className="bw-theme-preview" style={style}>
        <div className="bw-theme-preview__bar">
          <span className="bw-theme-preview__logo">BodyWork Centrum</span>
          <span className="bw-theme-preview__links">
            <span>Oferta</span>
            <span>Zespół</span>
            <span>Kontakt</span>
          </span>
        </div>

        <div className="bw-theme-preview__body">
          <h4 className="bw-theme-preview__heading">Fizjoterapia i trening</h4>
          <p className="bw-theme-preview__text">
            Tekst podstawowy w sekcji. <a href="#">Odnośnik</a> obok treści
            pomocniczej.
          </p>
          <p className="bw-theme-preview__muted">Tekst pomocniczy, np. podpis.</p>

          <div className="bw-theme-preview__actions">
            <span className="bw-theme-preview__btn bw-theme-preview__btn--primary">
              Zarezerwuj wizytę
            </span>
            <span className="bw-theme-preview__btn bw-theme-preview__btn--secondary">
              Dowiedz się więcej
            </span>
            <span className="bw-theme-preview__btn bw-theme-preview__btn--outline">
              Cennik
            </span>
          </div>

          <div className="bw-theme-preview__card">
            <span className="bw-theme-preview__badge">Nowość</span>
            <strong>Masaż leczniczy</strong>
            <span className="bw-theme-preview__muted">60 min: od 180 zł</span>
          </div>

          <div className="bw-theme-preview__states">
            <span className="bw-theme-preview__state bw-theme-preview__state--success">
              Zapisano
            </span>
            <span className="bw-theme-preview__state bw-theme-preview__state--warning">
              Uwaga
            </span>
            <span className="bw-theme-preview__state bw-theme-preview__state--error">
              Błąd
            </span>
            <span className="bw-theme-preview__state bw-theme-preview__state--info">
              Informacja
            </span>
          </div>
        </div>
      </div>

      <div className="bw-token-groups">
        {THEME_TOKEN_GROUPS.map((group) => (
          <div className="bw-token-group" key={group.name}>
            <span className="bw-token-group__label">{group.label}</span>
            <ul className="bw-token-group__list">
              {group.tokens.map((token) => (
                <li className="bw-token" key={token.name} title={token.cssVar}>
                  <span
                    className="bw-token__chip"
                    style={{ background: colors[`${group.name}.${token.name}`] }}
                  />
                  <span className="bw-token__name">{token.label}</span>
                  <code className="bw-token__value">
                    {colors[`${group.name}.${token.name}`]}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
