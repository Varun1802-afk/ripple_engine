import { toPng, toJpeg, toSvg } from 'html-to-image';

/**
 * Downloads the active decision graph canvas element as an Image (PNG, JPEG, SVG) or JSON dataset.
 * Captures 100% of the entire unclipped graph tree regardless of scroll state or zoom scale.
 */
export async function downloadGraphAsImage({ format = 'png', elementId = 'graph-canvas-export-target', filename = 'ripple_engine_decision_graph' }) {
  console.log(`📸 [Export Utility] Initiating full graph download in format: ${format}...`);

  // Target graph canvas element by ID or class fallback
  let container = document.getElementById(elementId);
  if (!container) {
    container = document.querySelector('.graph-canvas-container') || document.querySelector('.graph-viewport');
  }

  if (!container) {
    alert("Graph canvas element not found. Please navigate to graph view before exporting.");
    return { success: false, error: "Canvas container element not found" };
  }

  // Save original style transform and transition
  const originalTransform = container.style.transform;
  const originalTransition = container.style.transition;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportFileName = `${filename}_${timestamp}.${format}`;

    // Temporarily reset pan/zoom transform so html-to-image captures full 1:1 scale tree
    container.style.transform = 'scale(1) translate(0px, 0px)';
    container.style.transition = 'none';

    // Calculate complete unclipped bounds of the entire decision graph tree
    const fullWidth = Math.max(container.scrollWidth, container.offsetWidth, 1600);
    const fullHeight = Math.max(container.scrollHeight, container.offsetHeight, 1000);

    const filterOptions = {
      quality: 0.98,
      pixelRatio: 2, // High resolution Retina export
      width: fullWidth + 80,
      height: fullHeight + 80,
      canvasWidth: (fullWidth + 80) * 2,
      canvasHeight: (fullHeight + 80) * 2,
      backgroundColor: '#E6E8EC',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top center',
        width: `${fullWidth + 80}px`,
        height: `${fullHeight + 80}px`,
        margin: '0',
        padding: '40px'
      },
      filter: (node) => {
        if (node.classList) {
          if (node.classList.contains('no-export') || node.classList.contains('zoom-toolbar') || node.classList.contains('info-panel-drawer')) {
            return false;
          }
        }
        return true;
      }
    };

    let dataUrl = '';

    if (format === 'png') {
      dataUrl = await toPng(container, filterOptions);
    } else if (format === 'jpeg' || format === 'jpg') {
      dataUrl = await toJpeg(container, filterOptions);
    } else if (format === 'svg') {
      dataUrl = await toSvg(container, filterOptions);
    }

    // Trigger browser file download
    const link = document.createElement('a');
    link.download = exportFileName;
    link.href = dataUrl;
    link.click();

    console.log(`✅ [Export Utility] Full graph exported successfully as ${exportFileName} (${fullWidth}x${fullHeight}px)`);
    return { success: true, fileName: exportFileName };
  } catch (err) {
    console.error(`❌ [Export Utility] Failed to export full graph as ${format}:`, err);
    alert(`Failed to export full graph as ${format.toUpperCase()}. Please try again.`);
    return { success: false, error: err.message };
  } finally {
    // Restore original transform and transition
    if (container) {
      container.style.transform = originalTransform;
      container.style.transition = originalTransition;
    }
  }
}

/**
 * Downloads the active decision session data as a structured JSON file.
 */
export function downloadGraphAsJSON({ decision, nodes, sessionId }) {
  try {
    const timestamp = new Date().toISOString().slice(0, 10);
    const exportFileName = `ripple_decision_${sessionId || 'export'}_${timestamp}.json`;

    const exportData = {
      version: '1.0.0',
      sessionId: sessionId || 'session_export',
      exportedAt: new Date().toISOString(),
      decision: decision || 'Strategic Policy Decision',
      nodesCount: (nodes || []).length,
      nodes: nodes || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", exportFileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    console.log(`✅ [Export Utility] Decision JSON exported as ${exportFileName}`);
    return { success: true, fileName: exportFileName };
  } catch (err) {
    console.error("❌ [Export Utility] Failed to export JSON:", err);
    alert("Failed to export decision JSON dataset.");
    return { success: false, error: err.message };
  }
}
