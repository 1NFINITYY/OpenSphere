'use client'

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const paginationPluginKey = new PluginKey('pagination')

export const PaginationExtension = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: paginationPluginKey,

        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              pageCount: 1,
              isGrid: false,
            }
          },

          apply(tr, value) {
            const meta = tr.getMeta('pagination')

            if (meta) {
              const next = { ...value }

              if (meta.decorations !== undefined) {
                next.decorations = DecorationSet.create(
                  tr.doc,
                  meta.decorations
                )
              }

              if (meta.pageCount !== undefined) {
                next.pageCount = meta.pageCount
              }

              if (meta.isGrid !== undefined) {
                next.isGrid = meta.isGrid
              }

              return next
            }

            return {
              ...value,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            }
          },
        },

        props: {
          decorations(state) {
            return this.getState(state).decorations
          },
        },

        view(editorView) {
          const measureAndDecorate = () => {
            const { state, dispatch } = editorView
            const view = editorView

            const pluginState = paginationPluginKey.getState(state)
            const isGrid = pluginState?.isGrid || false

            const PAGE_HEIGHT_PX = 1056
            const PAGE_GAP_PX = 48
            const MARGIN_TOP = 96
            const MARGIN_BOTTOM = 96
            const CONTENT_HEIGHT =
              PAGE_HEIGHT_PX - MARGIN_TOP - MARGIN_BOTTOM

            const dom = view.dom
            const scale =
              dom.getBoundingClientRect().width / dom.offsetWidth || 1

            const decorations = []
            let accumulatedHeight = 0
            let pageNumber = 1
            let pendingSplit = null

            const insertSpacer = (pos, height) => {
              const el = document.createElement('div')
              el.className = 'page-spacer'
              el.style.height = `${height}px`
              el.contentEditable = 'false'
              decorations.push(Decoration.widget(pos, el))
            }

            const findSplitPosAbsolute = (
              nodePos,
              node,
              targetAbsY
            ) => {
              let low = 0
              let high = node.content.size
              let best = 0

              while (low <= high) {
                const mid = Math.floor((low + high) / 2)
                if (mid === 0) {
                  low = 1
                  continue
                }

                const coords = view.coordsAtPos(nodePos + mid)
                if (coords.bottom > targetAbsY) {
                  best = mid
                  high = mid - 1
                } else {
                  low = mid + 1
                }
              }

              return best
            }

            state.doc.forEach((node, pos) => {
              if (pendingSplit) return

              const domNode = view.nodeDOM(pos)
              if (!domNode || !(domNode instanceof HTMLElement)) return

              const style = window.getComputedStyle(domNode)

              // Use getBoundingClientRect for sub-pixel precision to avoid drift
              const rect = domNode.getBoundingClientRect()
              const height = rect.height / scale

              const marginTop = parseFloat(style.marginTop) || 0
              const marginBottom = parseFloat(style.marginBottom) || 0
              const effectiveHeight = height + marginTop + marginBottom

              if (!effectiveHeight) return

              const lineHeight =
                parseFloat(style.lineHeight) ||
                parseFloat(style.fontSize) * 1.2

              const lineCount = height / lineHeight

              const isMassiveParagraph =
                node.isTextblock &&
                lineCount > 3 &&
                effectiveHeight > CONTENT_HEIGHT

              // ✅ MASSIVE PARAGRAPH SPLITTING
              if (isMassiveParagraph) {
                const available =
                  CONTENT_HEIGHT - accumulatedHeight

                if (available <= 0) {
                  insertSpacer(
                    pos,
                    MARGIN_BOTTOM + PAGE_GAP_PX + MARGIN_TOP
                  )
                  pageNumber++
                  accumulatedHeight = 0
                  return
                }

                const nodeRect = domNode.getBoundingClientRect()
                const targetY =
                  nodeRect.top + available * scale

                const splitOffset = findSplitPosAbsolute(
                  pos,
                  node,
                  targetY
                )

                if (
                  splitOffset > 0 &&
                  splitOffset < node.content.size
                ) {
                  pendingSplit = pos + splitOffset
                }

                return
              }

              // ✅ NORMAL PARAGRAPH (≤ 3 lines)
              if (accumulatedHeight + effectiveHeight > CONTENT_HEIGHT) {
                const remaining =
                  CONTENT_HEIGHT - accumulatedHeight

                const spacerHeight = isGrid
                  ? remaining
                  : remaining +
                  MARGIN_BOTTOM +
                  PAGE_GAP_PX +
                  MARGIN_TOP

                insertSpacer(pos, spacerHeight)
                pageNumber++
                accumulatedHeight = effectiveHeight
              } else {
                accumulatedHeight += effectiveHeight
              }
            })

            if (pendingSplit) {
              dispatch(state.tr.split(pendingSplit))
              return
            }

            const footerPos = state.doc.content.size
            const footer = document.createElement('div')
            footer.className = 'page-footer'
            footer.setAttribute(
              'data-page-number',
              String(pageNumber)
            )
            footer.style.marginTop = `${CONTENT_HEIGHT - accumulatedHeight
              }px`
            footer.contentEditable = 'false'

            decorations.push(Decoration.widget(footerPos, footer))

            dispatch(
              state.tr.setMeta('pagination', {
                decorations,
                pageCount: pageNumber,
              })
            )
          }

          return {
            update(view, prevState) {
              if (
                !prevState ||
                !view.state.doc.eq(prevState.doc)
              ) {
                requestAnimationFrame(() => {
                  if (!view.isDestroyed) {
                    measureAndDecorate()
                  }
                })
              }
            },
          }
        },
      }),
    ]
  },
})
