import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { Check, Cpu, Sparkles } from 'lucide-react';
import './Routing.css';

export const BedrockExplanation: React.FC = () => {
  const { bedrockExplanation, isBedrockLoading } = useSafeRoute();

  return (
    <section className="bedrock-explanation-card">
      <div className="bedrock-header">
        <div className="bedrock-title-group">
          <div className="bedrock-icon-wrap">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="bedrock-title">Amazon Bedrock briefing</h3>
            <span className="bedrock-model-tag">
              <Cpu size={11} />
              {bedrockExplanation?.modelId ?? 'anthropic.claude-3-haiku'}
            </span>
          </div>
        </div>
      </div>

      {isBedrockLoading && !bedrockExplanation ? (
        <div className="bedrock-loading">
          <div className="shimmer-line" />
          <div className="shimmer-line short" />
          <p className="loading-text">Generating coordinator-facing detour rationale…</p>
        </div>
      ) : bedrockExplanation ? (
        <div className="bedrock-content">
          <p className="bedrock-summary">{bedrockExplanation.summary}</p>
          <div className="justification-box">
            <div className="justification-heading">Why the extra minutes</div>
            <p className="justification-text">{bedrockExplanation.detourJustification}</p>
          </div>
          <div className="hazards-avoided-section">
            <div className="avoided-title">Hazards avoided</div>
            <ul className="avoided-list">
              {bedrockExplanation.keyHazardsAvoided.map((hazard) => (
                <li key={hazard} className="avoided-item">
                  <Check size={13} className="check-icon" />
                  <span>{hazard}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="loading-text">Route explanation appears after the first Dijkstra solve.</p>
      )}
    </section>
  );
};
