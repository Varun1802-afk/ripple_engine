import React from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import '../styles/loader.css';

export function LoaderOverlay() {
  const { loadingStates } = useGraph();

  const isLoading = Boolean(
    loadingStates.isGenerating ||
    loadingStates.expandingNodeId ||
    loadingStates.isAlternateLoading ||
    loadingStates.isConvergenceLoading
  );

  if (!isLoading) return null;

  return (
    <div className="hamster-loader-backdrop">
      <div className="hamster-loader-container">
        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
          <div className="wheel" />
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear" />
                <div className="hamster__eye" />
                <div className="hamster__nose" />
              </div>
              <div className="hamster__limb hamster__limb--fr" />
              <div className="hamster__limb hamster__limb--fl" />
              <div className="hamster__limb hamster__limb--br" />
              <div className="hamster__limb hamster__limb--bl" />
              <div className="hamster__tail" />
            </div>
          </div>
          <div className="spoke" />
        </div>
        <div className="hamster-loading-text">
          Fetching decision data & simulating consequences...
        </div>
      </div>
    </div>
  );
}
