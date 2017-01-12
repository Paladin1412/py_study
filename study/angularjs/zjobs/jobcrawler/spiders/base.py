# -*- coding: utf-8 -*-
import datetime
from scrapy.contrib.spiders.crawl import CrawlSpider
from scrapy.http.request import Request
from jobcrawler.models import JobItem, BlockedContact, RejectionPattern
from app.context import Config as config
from app.context import logger


class BaseSpider(CrawlSpider):
    name = "base"
    allowed_domains = []
    start_urls = ()

    rules = ()

    def parse_start_url(self, response):
        return self.parse_item(response)


    def parse_item(self, response):
        return self.parse_item_requests_callback(response, '')
        

    def parse_item_requests_callback(self, response, item_xpath_selector=''):
        requests = []
        for job_item in response.xpath(item_xpath_selector):

            job_crawler_item = JobItem()
            self.populate_job_crawler_item(job_item, job_crawler_item)

            if self.should_load_details(job_crawler_item):
                requests.append(
                    Request(url=job_crawler_item.job_details_link, callback=self.retrieve_job_details,
                            meta={'item': job_crawler_item}, dont_filter=True))

        return requests


    def populate_job_crawler_item(self, detail_item, job_crawler_item):
        pass

    def retrieve_job_details(self, response):
        yield None

    def should_load_details(self, job_item):
        if JobItem.is_exists(job_item):
            logger.info('[%s] skipping loading details as job already exists. job_title: %s' % (self.name, job_item.job_title))
            return False
        if JobItem.is_older_required(job_item):
            logger.info('[%s] skipping loading details as job is older than %s days. job_title: %s' % (self.name, str(config.HOUSEKEEPING_RECORD_ORDLER_THAN), job_item.job_title))
            return False

        if BlockedContact.is_contact_blocked(job_item.contact):
            logger.info('[%s] skipping loading details as job contact is blocked. contact: %s' % (self.name, job_item.contact))
            return False

        if RejectionPattern.should_be_rejected(job_item.job_title):
            logger.info('[%s] skipping loading details as job matches rejection pattern. job_title: %s' % (self.name, job_item.job_title))
            return False

        return True


    def derieve_date_from_short_date_string(self, date_string):
        year = datetime.datetime.today().year
        if datetime.datetime.strptime( '%d-%s' % ( year, date_string), "%Y-%m-%d" ) > datetime.datetime.now():
            year = datetime.datetime.today().year - 1
        return datetime.datetime.strptime( '%d-%s' % ( year, date_string), "%Y-%m-%d" )


