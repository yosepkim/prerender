require 'watir'
require 'headless'

browser = Watir::Browser.new :chrome, headless: true
browser.goto ("wikipedia.org")

puts browser.links.count
