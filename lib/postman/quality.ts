import { DocumentationProject, DocumentationSection, QualityReport, QualityFinding } from '../types/documentation';

export function calculateQualityReport(project: DocumentationProject): QualityReport {
  let totalEndpoints = 0;
  let endpointsWithDescriptions = 0;
  let endpointsWithMethods = 0;
  let endpointsWithRequestExamples = 0;
  let endpointsWithResponseExamples = 0;
  let missingDescriptionsCount = 0;
  let missingParametersCount = 0;
  let missingResponsesCount = 0;

  const findings: QualityFinding[] = [];

  function traverseSections(sections: DocumentationSection[]) {
    for (const sec of sections) {
      if (sec.type === 'endpoint' && sec.endpoint) {
        const ep = sec.endpoint;
        totalEndpoints++;

        // Method check
        if (ep.method) {
          endpointsWithMethods++;
        }

        // Description check
        if (ep.description && ep.description.trim().length > 0) {
          endpointsWithDescriptions++;
        } else {
          missingDescriptionsCount++;
          findings.push({
            id: `find-desc-${ep.id}`,
            type: 'warning',
            message: `Endpoint "${ep.name}" is missing a description`,
            targetId: sec.id,
            targetName: ep.name,
            field: 'description',
          });
        }

        // Parameters check (headers, path, query)
        const allParams = [...ep.headers, ...ep.pathParameters, ...ep.queryParameters];
        for (const p of allParams) {
          if (!p.description || p.description.trim().length === 0) {
            missingParametersCount++;
            findings.push({
              id: `find-param-${ep.id}-${p.name}`,
              type: 'warning',
              message: `Parameter "${p.name}" in "${ep.name}" is missing a description`,
              targetId: sec.id,
              targetName: ep.name,
              field: 'parameters',
            });
          }
        }

        // Request Body check
        if (ep.requestBody && ep.requestBody.mode !== 'none' && ep.requestBody.rawContent) {
          endpointsWithRequestExamples++;
        }

        // Responses check
        if (ep.responses && ep.responses.length > 0) {
          endpointsWithResponseExamples++;
        } else {
          missingResponsesCount++;
          findings.push({
            id: `find-resp-${ep.id}`,
            type: 'warning',
            message: `Endpoint "${ep.name}" has no response examples documented`,
            targetId: sec.id,
            targetName: ep.name,
            field: 'responses',
          });
        }

        // Incomplete authentication
        if (ep.authentication && ep.authentication.type !== 'none') {
          if (
            (ep.authentication.type === 'bearer' && !ep.authentication.details?.token) ||
            (ep.authentication.type === 'basic' && !ep.authentication.details?.username)
          ) {
            findings.push({
              id: `find-auth-${ep.id}`,
              type: 'warning',
              message: `Endpoint "${ep.name}" has incomplete authentication configuration`,
              targetId: sec.id,
              targetName: ep.name,
              field: 'authentication',
            });
          }
        }
      }

      if (sec.children && sec.children.length > 0) {
        traverseSections(sec.children);
      }
    }
  }

  traverseSections(project.sections);

  // Positive baseline findings
  if (totalEndpoints > 0) {
    findings.unshift({
      id: 'find-endpoints-ok',
      type: 'success',
      message: `${totalEndpoints} endpoints detected and parsed`,
    });
  }
  if (endpointsWithDescriptions > 0) {
    findings.unshift({
      id: 'find-desc-ok',
      type: 'success',
      message: `${endpointsWithDescriptions} of ${totalEndpoints} endpoints have descriptions`,
    });
  }
  if (endpointsWithResponseExamples > 0) {
    findings.unshift({
      id: 'find-resp-ok',
      type: 'success',
      message: `${endpointsWithResponseExamples} endpoints have response examples`,
    });
  }

  // Calculate score (0 to 100)
  let score = 100;
  if (totalEndpoints > 0) {
    const descRatio = endpointsWithDescriptions / totalEndpoints;
    const respRatio = endpointsWithResponseExamples / totalEndpoints;
    score = Math.round(descRatio * 50 + respRatio * 50);
  }

  return {
    score,
    totalEndpoints,
    endpointsWithDescriptions,
    endpointsWithMethods,
    endpointsWithRequestExamples,
    endpointsWithResponseExamples,
    missingDescriptionsCount,
    missingParametersCount,
    missingResponsesCount,
    findings,
  };
}

