require 'watir'
require 'headless'

browser = Watir::Browser.new :chrome, headless: true

def process_link(target_link)
    browser.goto target_link
    browser.links.each do |link|
        `node ../prerender-runner/index.js #{target_link}`
        process_link(link)
        sleep 10
    end
end

process_link('https://www.brooksrunning.com/en_us/sitemap/')