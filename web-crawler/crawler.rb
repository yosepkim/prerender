require 'watir'
require 'headless'

class Crawler

    @@processed = []

    def process_link(hostname, target_link, browser)
        if target_link.kind_of?(String) && !@@processed.include?(target_link) && target_link.start_with?(hostname)
            browser.goto(target_link)
            `node ../prerender-runner/index.js #{target_link} &`
            sleep 10
            @@processed.push(target_link)
            browser.links.each do |link|
                puts "processing #{link.href}"
                process_link(hostname, link.href, browser)
            end
        end
    end

end

browser = Watir::Browser.new :chrome, headless: true

crawler = Crawler.new


crawler.process_link('https://www.brooksrunning.com', 'https://www.brooksrunning.com/en_us/sitemap/', browser)
#crawler.process_link('https://cars.edgecloud9.com', 'https://cars.edgecloud9.com/', browser)