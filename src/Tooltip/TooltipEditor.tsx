/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from "react";
import copy from "clipboard-copy";
import { stringify, parse } from "yaml";
import {
  Button,
  Icon,
  Label,
  NavbarHeading as Heading,
  Tabs,
  Tab,
} from "@blueprintjs/core";
import css from "./TooltipEditor.css";

export interface TooltipDictionaryValue {
  content: string;
  width: string;
}

export interface TooltipDictionaryInterface {
  [tooltipId: string]: string | TooltipDictionaryValue;
}

export interface TooltipEditorProps {
  tooltipDictionary: TooltipDictionaryInterface;
  onClose?: () => void;
  setPreviewDatasetFromLocalStorage?: (value: number) => void;
}

const getDefaultTooltipRecord = (
  tooltipDictionary: TooltipDictionaryInterface
): TooltipDictionaryInterface => {
  let toReturn: TooltipDictionaryInterface = tooltipDictionary;
  const fromLocalStorage = localStorage.getItem("tooltipDictionary");
  if (typeof fromLocalStorage === "string") {
    // This means 'Save' has been clicked
    try {
      const parsed = JSON.parse(fromLocalStorage);
      const isExpired = Date.now() > parsed?.expiry;
      if (!isExpired) {
        toReturn = parsed.value;
      } else {
        localStorage.removeItem("tooltipDictionary");
      }
    } catch (e) {
      window.alert(`Error while parsing latest dataset - ${e}`);
    }
  }
  return toReturn;
};

export const getNodeTooltipId = (node: unknown): string =>
  (node as HTMLElement)?.dataset?.tooltipId || "";

export const TooltipEditor = (props: TooltipEditorProps) => {
  const [allTooltips, setAllTooltips] = useState<NodeListOf<Element>>(
    document.querySelectorAll("[data-tooltip-id]") || []
  );
  const tooltipDictionary = props.tooltipDictionary;
  const [
    editedTooltips,
    setEditedTooltips,
  ] = useState<TooltipDictionaryInterface>(
    getDefaultTooltipRecord(tooltipDictionary)
  );
  const [editMode, setEditMode] = useState<Record<string, boolean | undefined>>(
    {}
  );
  const [searchResults, setSearchResults] = useState<NodeListOf<Element>>(
    allTooltips
  );
  const [mode, setMode] = useState("edit");
  const [latestDataset, updateLatestDataset] = useState("");

  const indicateTooltipsWithEmptyContent = (
    tooltipNodes: NodeListOf<Element>,
    editedTooltips: TooltipDictionaryInterface
  ): void => {
    Array.from(tooltipNodes).forEach((tooltipNode) => {
      const tooltipId = getNodeTooltipId(tooltipNode);
      if (tooltipId && !getTooltipContent(editedTooltips, tooltipId)) {
        // Remove this class on unmount
        tooltipNode.classList.add(css.emptyTooltipContent);
      }
    });
  };

  const removeEmptyContentClass = (tooltipNodes: NodeListOf<Element>) => {
    Array.from(tooltipNodes).forEach((tooltipNode) => {
      if (tooltipNode.classList.contains(css.emptyTooltipContent)) {
        tooltipNode.classList.remove(css.emptyTooltipContent);
      }
    });
  };

  const handleTooltipNodeClick = (tooltipId: string) => {
    setEditMode({
      ...{ [tooltipId]: true },
    });
  };

  const handleTooltipNodeMouseOver = (tooltipId: string) => {
    const labelNode = document.getElementById(tooltipId);
    labelNode?.classList.add(css.bold);
  };

  const handleTooltipNodeMouseOut = (tooltipId: string) => {
    const labelNode = document.getElementById(tooltipId);
    if (labelNode?.classList.contains(css.bold)) {
      labelNode?.classList.remove(css.bold);
    }
  };

  const attachEventHandlersToTooltipNodes = (
    allTooltips: NodeListOf<Element>
  ): void => {
    Array.from(allTooltips).forEach((tooltipNode) => {
      const tooltipId = getNodeTooltipId(tooltipNode);
      tooltipNode.addEventListener("click", () =>
        handleTooltipNodeClick(tooltipId)
      );
      tooltipNode.addEventListener("mouseover", () =>
        handleTooltipNodeMouseOver(tooltipId)
      );
      tooltipNode.addEventListener("mouseout", () =>
        handleTooltipNodeMouseOut(tooltipId)
      );
    });
  };

  const removeEventHandlersFromTooltipNodes = (
    allTooltips: NodeListOf<Element>
  ): void => {
    Array.from(allTooltips).forEach((tooltipNode) => {
      const tooltipId = getNodeTooltipId(tooltipNode);
      tooltipNode.removeEventListener("click", () =>
        handleTooltipNodeClick(tooltipId)
      );
      tooltipNode.removeEventListener("mouseover", () =>
        handleTooltipNodeMouseOver(tooltipId)
      );
      tooltipNode.removeEventListener("mouseout", () =>
        handleTooltipNodeMouseOut(tooltipId)
      );
    });
  };

  const filterDataForSearch = (value: string) => {
    let filtered: NodeListOf<Element> = allTooltips;
    if (!value) {
      setSearchResults(filtered);
    }
    filtered = (Array.from(allTooltips).filter((node) =>
      getNodeTooltipId(node)
        .trim()
        .toLowerCase()
        ?.includes(value.trim().toLowerCase())
    ) as unknown) as NodeListOf<Element>;
    setSearchResults(filtered);
  };

  const addDraggableProperty = (editorbody: HTMLElement) => {
    const draggableHeader = document.getElementById("draggable");

    // Source: https://www.w3schools.com/howto/howto_js_draggable.asp
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const elementDrag = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      editorbody.style.top = editorbody.offsetTop - pos2 + "px";
      editorbody.style.left = editorbody.offsetLeft - pos1 + "px";
    };

    const closeDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };

    const dragMouseDown = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    if (draggableHeader) {
      draggableHeader.onmousedown = dragMouseDown;
    }
  };

  const cleanup = () => {
    removeEventHandlersFromTooltipNodes(allTooltips);
    removeEmptyContentClass(allTooltips);
  };

  useEffect(() => {
    indicateTooltipsWithEmptyContent(allTooltips, editedTooltips);
  }, [editedTooltips]);

  useEffect(() => {
    attachEventHandlersToTooltipNodes(allTooltips);
    const editorBody = document.getElementById("ngTooltipEditorRoot");
    if (editorBody) {
      addDraggableProperty(editorBody);
    }

    return cleanup;
  }, []);

  const updateContext = () => {
    const updatedList = document.querySelectorAll("[data-tooltip-id]") || [];
    setAllTooltips(updatedList);
    setSearchResults(updatedList);
    attachEventHandlersToTooltipNodes(updatedList);
    indicateTooltipsWithEmptyContent(updatedList, editedTooltips);
  };

  const getTooltipWidthValue = (
    editedTooltips: TooltipDictionaryInterface,
    tooltipId: string
  ): string => {
    if (typeof editedTooltips[tooltipId] === "object") {
      return (editedTooltips[tooltipId] as TooltipDictionaryValue).width;
    }
    return "400";
  };

  const getTooltipContent = (
    editedTooltips: TooltipDictionaryInterface,
    tooltipId: string
  ) =>
    typeof editedTooltips[tooltipId] === "object"
      ? (editedTooltips[tooltipId] as TooltipDictionaryValue).content
      : (editedTooltips[tooltipId] as string);

  return (
    <div id="ngTooltipEditorRoot" className={css.ngTooltipEditorRoot}>
      <div className={css.editorHeadingRow}>
        <Heading className={css.draggable} id="draggable">
          Total Tooltip ID(s) in context - {allTooltips?.length}
        </Heading>
        <Tabs
          id="mode"
          className={css.tabList}
          onChange={(id) => setMode(id as string)}
          selectedTabId={mode}
        >
          <Tab
            id="edit"
            title="Edit Tooltips in context"
            panel={
              <>
                <div className={css.learnMoreContainer}>
                  <div className={css.learnMore}>
                    <Icon icon="info-sign" />
                    <div className={css.learnMoreText}>
                      Learn more about the new tooltip framework{" "}
                      <a
                        href="https://harness.atlassian.net/wiki/spaces/CDNG/pages/1626144816/NG+Tooltip+Framework+-+self+help+guide+for+docs"
                        target="_blank"
                      >
                        here
                      </a>
                    </div>
                    <Button
                      intent="primary"
                      icon="updated"
                      className={css.updateContext}
                      onClick={() => updateContext()}
                      text="Update Context"
                    />
                  </div>
                  <Button
                    className={css.updateContext}
                    text="Preview Tooltips"
                    onClick={() => {
                      const withExpiry = {
                        value: editedTooltips,
                        expiry: Date.now() + 2 * 60 * 60 * 1000,
                      };
                      localStorage.setItem(
                        "previewTooltipDataset",
                        JSON.stringify(withExpiry)
                      );
                      props.setPreviewDatasetFromLocalStorage?.(Date.now());
                    }}
                  />
                </div>
                {allTooltips?.length ? (
                  <div className={css.tooltipContentWrapper}>
                    <div className={css.tooltipEditRow}>
                      <Heading className={css.tooltipIdLabelHeading}>
                        ID
                      </Heading>
                      <Heading>
                        <label>
                          Tooltip Content (Markdown)&nbsp;
                          <a
                            title="See Markdown examples"
                            href="https://www.markdownguide.org/cheat-sheet"
                            target="_blank"
                          >
                            See how markdowns work?
                          </a>
                        </label>
                      </Heading>
                    </div>
                    {Array.from(searchResults).map((node) => {
                      const tooltipId = getNodeTooltipId(node);
                      return (
                        <div className={css.tooltipEditRow} key={tooltipId}>
                          <Label
                            className={css.tooltipIdLabel}
                            id={tooltipId}
                            title={tooltipId}
                            onMouseOver={() => {
                              node.classList.add(css.bold);
                            }}
                            onMouseOut={() => {
                              if (node.classList.contains(css.bold)) {
                                node.classList.remove(css.bold);
                              }
                            }}
                          >
                            {tooltipId}
                          </Label>
                          {editMode[tooltipId] ? (
                            <div className={css.textareaAndWidth}>
                              <textarea
                                placeholder="Enter Markdown"
                                style={{
                                  minWidth: 550,
                                  maxWidth: 550,
                                  minHeight: 100,
                                  maxHeight: 300,
                                  padding: "15px",
                                  marginLeft: "15px",
                                }}
                                value={getTooltipContent(
                                  editedTooltips,
                                  tooltipId
                                )}
                                id={`${tooltipId}TextArea`}
                                autoFocus={true}
                                onChange={(e) => {
                                  const changedValue = e.target.value;
                                  setEditedTooltips({
                                    ...editedTooltips,
                                    ...{
                                      [tooltipId]: {
                                        content: changedValue,
                                        width: getTooltipWidthValue(
                                          editedTooltips,
                                          tooltipId
                                        ),
                                      },
                                    },
                                  });
                                }}
                              />
                              <div className={css.contentWidth}>
                                <Label>Width</Label>
                                <input
                                  value={getTooltipWidthValue(
                                    editedTooltips,
                                    tooltipId
                                  )}
                                  onChange={(ev) => {
                                    const tooltipContent = getTooltipContent(
                                      editedTooltips,
                                      tooltipId
                                    );
                                    const changedValue = ev.target.value;
                                    setEditedTooltips({
                                      ...editedTooltips,
                                      ...{
                                        [tooltipId]: {
                                          content: tooltipContent,
                                          width: changedValue,
                                        },
                                      },
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className={css.labelRow}>
                              <Label className={css.tooltipContentLabel}>
                                {getTooltipContent(editedTooltips, tooltipId) ||
                                  ""}
                              </Label>
                              <Button
                                text="Edit"
                                icon="edit"
                                className={css.editIcon}
                                onClick={() => {
                                  setEditMode({
                                    ...{ [tooltipId]: true },
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={css.noTooltips}>
                    No toolip IDs found in the present context.
                  </div>
                )}
                {allTooltips?.length ? (
                  <div className={css.buttons}>
                    <Button
                      intent="primary"
                      icon="clipboard"
                      text="Copy to clipboard"
                      onClick={() => copy(stringify(editedTooltips))}
                    />
                    <Button
                      className={css.secondButton}
                      text="Save"
                      icon="saved"
                      onClick={() => {
                        // set expiry 6 hours from now
                        const withExpiry = {
                          value: editedTooltips,
                          expiry: Date.now() + 6 * 60 * 60 * 1000,
                        };
                        localStorage.setItem(
                          "tooltipDictionary",
                          JSON.stringify(withExpiry)
                        );
                      }}
                    />
                  </div>
                ) : null}
              </>
            }
          />
          <Tab
            id="latest"
            title="Update latest dataset"
            panel={
              <div className={css.latestDatasetEditor}>
                <div>
                  Copy the latest dataset from{" "}
                  <a
                    href="https://github.com/harness/ng-tooltip/blob/main/src/Tooltip/TooltipDictionary.yaml"
                    target="_blank"
                  >
                    here
                  </a>
                  . Please note once you update the latest dataset, all current
                  work will be lost.
                </div>
                <textarea
                  className={css.latestDatasetTextarea}
                  onChange={(ev) => {
                    try {
                      const latestDatasetParsed = parse(ev.target.value);
                      updateLatestDataset(latestDatasetParsed);
                    } catch (e) {
                      window.alert(`Error while copying latest dataset - ${e}`);
                    }
                  }}
                />
                <Button
                  intent="primary"
                  icon="clipboard"
                  text="Update"
                  onClick={() => {
                    try {
                      const jsStr = JSON.stringify(latestDataset);
                      const toJson = JSON.parse(jsStr);
                      setEditedTooltips(toJson);
                    } catch (e) {
                      window.alert(
                        `Error while updating latest dataset - ${e}`
                      );
                    }
                  }}
                />
              </div>
            }
          />
          <Tabs.Expander />
          <input
            className={css.searchInput}
            placeholder="Search for ID"
            onChange={(event) =>
              filterDataForSearch((event.target as any).value)
            }
          />
          <Icon
            icon="cross"
            className={css.closeButton}
            onClick={() => {
              props.onClose?.();
              localStorage.removeItem("previewTooltipDataset");
            }}
          />
        </Tabs>
      </div>
    </div>
  );
};
