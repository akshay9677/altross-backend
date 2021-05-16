import Page from "./page"

const subscriptionPages = () => {
  const page = new Page("subscriptions")

  const tab1 = new Page.Tab("summary", "Summary")
  const summaryWidget = new Page.Widget("summary")
  tab1.addWidget(summaryWidget, "100%")

  page.addTab(tab1)

  const tab2 = new Page.Tab("notes", "Notes")
  const notesWidget = new Page.Widget("notes", "100%", "350px")
  tab2.addWidget(notesWidget)

  page.addTab(tab2)

  return page
}

export default subscriptionPages
